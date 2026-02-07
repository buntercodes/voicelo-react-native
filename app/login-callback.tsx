import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function LoginCallback() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const { user } = useAuth();

    // If we somehow get stuck here and we have a user, go home.
    if (user) {
        return <Redirect href="/" />;
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );
}
