import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    themeMode: ThemeMode;
    colorScheme: 'light' | 'dark';
    setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const deviceColorScheme = useDeviceColorScheme() ?? 'light';
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
    const [resolvedColorScheme, setResolvedColorScheme] = useState<'light' | 'dark'>(deviceColorScheme);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('user-theme-mode');
                if (savedTheme) {
                    setThemeModeState(savedTheme as ThemeMode);
                }
            } catch (e) {
                console.error('Failed to load theme', e);
            }
        };
        loadTheme();
    }, []);

    useEffect(() => {
        if (themeMode === 'system') {
            setResolvedColorScheme(deviceColorScheme);
        } else {
            setResolvedColorScheme(themeMode);
        }
    }, [themeMode, deviceColorScheme]);

    const setThemeMode = async (mode: ThemeMode) => {
        setThemeModeState(mode);
        try {
            await AsyncStorage.setItem('user-theme-mode', mode);
        } catch (e) {
            console.error('Failed to save theme', e);
        }
    };

    return (
        <ThemeContext.Provider value={{ themeMode, colorScheme: resolvedColorScheme, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
