import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignInScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginWithGoogle } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            await login(email, password);
            router.replace('/');
        } catch (error: any) {
            Alert.alert('Login Failed', error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={[styles.header, { marginTop: insets.top + 40 }]}>
                    <ThemedText type="title">Welcome Back</ThemedText>
                    <ThemedText colorName="muted" style={styles.subtitle}>
                        Sign in to continue to your account
                    </ThemedText>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Email"
                        placeholder="hello@example.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <Input
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <Button
                        title="Sign In"
                        onPress={handleLogin}
                        loading={loading}
                        style={styles.button}
                    />

                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <ThemedText style={styles.dividerText}>or continue with</ThemedText>
                        <View style={styles.dividerLine} />
                    </View>

                    <Button
                        title="Sign in with Google"
                        variant="white"
                        icon={<Ionicons name="logo-google" size={20} color="#EA4335" />}
                        onPress={async () => {
                            try {
                                await loginWithGoogle();
                                router.replace('/');
                            } catch (e: any) {
                                Alert.alert('Google Sign In Failed', e.message);
                            }
                        }}
                        style={styles.googleButton}
                    />

                    <View style={styles.footer}>
                        <ThemedText colorName="muted">Don't have an account? </ThemedText>
                        <Link href={'/(auth)/sign-up' as any} asChild>
                            <Button variant="ghost" title="Sign Up" style={{ height: 'auto', paddingHorizontal: 0 }} />
                        </Link>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    header: {
        marginBottom: 32,
    },
    subtitle: {
        marginTop: 8,
    },
    form: {
        flex: 1,
    },
    button: {
        marginTop: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32,
        gap: 4,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#EBEBE8',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#64748B',
        fontSize: 14,
    },
    googleButton: {
        marginTop: 0,
    },
});
