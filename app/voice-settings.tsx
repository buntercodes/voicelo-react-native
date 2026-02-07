import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VoiceSettingsScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <ThemedView style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
            <Stack.Screen
                options={{
                    title: 'Voice Settings',
                    headerShown: true,
                    headerLeft: () => null,
                    headerBackVisible: false,
                    headerStyle: { backgroundColor: theme.background },
                    headerTintColor: theme.text,
                    headerShadowVisible: false,
                    headerRight: () => (
                        <Pressable
                            onPress={() => router.back()}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={({ pressed }) => ({
                                opacity: pressed ? 0.6 : 1,
                                backgroundColor: theme.secondary,
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                justifyContent: 'center',
                                alignItems: 'center',
                            })}
                        >
                            <IconSymbol name="xmark" color={theme.text} size={16} />
                        </Pressable>
                    ),
                }}
            />

            <View style={styles.body}>
                <ThemedText colorName="muted" style={{ marginBottom: 16 }}>
                    Adjust speech rate and technical parameters for generation.
                </ThemedText>

                <View style={[styles.placeholder, { backgroundColor: theme.secondary, borderColor: theme.border }]}>
                    <ThemedText type="small" colorName="muted">Settings controls coming soon</ThemedText>
                </View>
            </View>

            <View style={{ flex: 1 }} />

            <Pressable
                style={[styles.doneBtn, { backgroundColor: theme.primary }]}
                onPress={() => router.back()}
            >
                <ThemedText style={styles.doneBtnText}>Done</ThemedText>
            </Pressable>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    body: {
        marginTop: 8,
    },
    placeholder: {
        height: 100,
        borderRadius: 12,
        borderStyle: 'dashed',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    doneBtn: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    doneBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
