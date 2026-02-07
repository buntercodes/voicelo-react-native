import { account } from '@/lib/appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import * as Network from 'expo-network';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { ID, Models, OAuthProvider } from 'react-native-appwrite';

const USER_STORAGE_KEY = 'auth_user';

interface AuthContextType {
    user: Models.User<Models.Preferences> | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkSession = async () => {
        let localUser = null;
        try {
            // Try to load from cache first for immediate responsiveness
            const cachedUserString = await AsyncStorage.getItem(USER_STORAGE_KEY);
            if (cachedUserString) {
                localUser = JSON.parse(cachedUserString);
                setUser(localUser);
            }

            // Check network status before making request
            const networkState = await Network.getNetworkStateAsync();
            if (!networkState.isConnected) {
                // If offline and we have a cached user, we're done
                if (localUser) {
                    setIsLoading(false);
                    return;
                }
            }

            const currentUser = await account.get();

            // Check if welcome credits need to be awarded
            if (!currentUser.prefs?.welcomeCreditsAwarded) {
                const welcomeCredits = 2000; // Default welcome credits
                await account.updatePrefs({
                    ...currentUser.prefs,
                    creditsTotal: (currentUser.prefs?.creditsTotal || 0) + welcomeCredits,
                    welcomeCredits: welcomeCredits,
                    welcomeCreditsAwarded: true,
                    creditsUsed: currentUser.prefs?.creditsUsed || 0
                });
                // Refresh user data after updating prefs
                const updatedUser = await account.get();
                setUser(updatedUser);
                await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
            } else {
                setUser(currentUser);
                await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
            }
        } catch (error: any) {
            // Only clear the user if the error is explicitly an authentication failure (401)
            // or if we're online and the session is invalid.
            if (error?.code === 401) {
                await AsyncStorage.removeItem(USER_STORAGE_KEY);
                setUser(null);
            } else {
                // For network errors or other issues, retain the local user if available
                if (localUser) {
                    setUser(localUser);
                } else {
                    setUser(null);
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkSession();
    }, []);

    const login = async (email: string, password: string) => {
        await account.createEmailPasswordSession(email, password);
        await checkSession();
    };

    const loginWithGoogle = async () => {
        try {
            const redirectUri = Linking.createURL('login-callback');
            const authUrl = await account.createOAuth2Token(
                OAuthProvider.Google,
                redirectUri,
                redirectUri,
            );

            if (!authUrl) throw new Error('Create OAuth2 token failed');

            const result = await WebBrowser.openAuthSessionAsync(authUrl.toString(), redirectUri);

            if (result.type === 'success') {
                setIsLoading(true);
                const { url } = result;
                const urlObj = new URL(url);
                const secret = urlObj.searchParams.get('secret');
                const userId = urlObj.searchParams.get('userId');

                if (secret && userId) {
                    await account.createSession(userId, secret);
                    await checkSession();
                } else {
                    setIsLoading(false);
                    throw new Error('OAuth callback missing params');
                }
            }
        } catch (error) {
            setIsLoading(false);
            console.error(error);
            throw error;
        }
    };

    const signup = async (email: string, password: string, name: string) => {
        await account.create(ID.unique(), email, password, name);
        await login(email, password);
    };

    const logout = async () => {
        try {
            await account.deleteSession('current');
        } catch (error) {
            // Ignore error if already logged out on server
        } finally {
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, signup, logout, checkSession }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
