import { useTheme } from '@/context/ThemeContext';

/**
 * Returns the current color scheme, either from the user's preference or the device's setting.
 */
export function useColorScheme() {
    try {
        const { colorScheme } = useTheme();
        return colorScheme;
    } catch {
        // Fallback for cases where ThemeProvider might not be ready or in use
        return 'light';
    }
}
