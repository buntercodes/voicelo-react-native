import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function PrivacyPolicyScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Privacy Policy',
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: theme.background },
                    headerTintColor: theme.text,
                }}
            />
            <WebView
                source={{ uri: 'https://voicelo.app/privacy' }}
                style={styles.webview}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={theme.primary} size="large" />
                    </View>
                )}
                injectedJavaScript={`
                    (function() {
                        const style = document.createElement('style');
                        style.innerHTML = \`
                            header, footer, nav, .header, .footer, .nav, .navbar { display: none !important; }
                            body, main, #__next, .main-content { 
                                padding-top: 0 !important; 
                                margin-top: 0 !important; 
                            }
                            body > div:first-child { 
                                margin-top: 0 !important; 
                                padding-top: 0 !important; 
                            }
                        \`;
                        document.head.appendChild(style);
                    })();
                    true;
                `}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    }
});
