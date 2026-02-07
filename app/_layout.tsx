import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = (segments[0] as string) === '(auth)';
    const isLoginCallback = (segments[0] as string) === 'login-callback';

    if (!user && !inAuthGroup && !isLoginCallback) {
      // Redirect to the sign-in page.
      router.replace('/(auth)/sign-in' as any);
    } else if (user && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace('/');
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colorScheme === 'dark' ? '#020617' : '#FAF9F6' }}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#4D9BFF' : '#0066FF'} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          animationDuration: 400,
          headerShown: false,
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="project/[id]"
          options={{
            animation: 'slide_from_right',
            headerShown: true,
            headerShadowVisible: false,
            headerBackTitle: '',
          }}
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen
          name="voice-settings"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="manage-projects"
          options={{
            headerShown: true,
            headerTitle: 'Manage Projects',
            headerLargeTitle: true,
            headerShadowVisible: false,
            headerBackTitle: '',
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
