import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { OFFICIAL_VOICES, useSettings } from '@/context/SettingsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VoiceSettingsScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { selectedVoiceId, setSelectedVoiceId } = useSettings();

    return (
        <ThemedView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <Pressable
                        onPress={() => router.back()}
                        style={({ pressed }) => [
                            styles.backButton,
                            { backgroundColor: theme.secondary },
                            pressed && { opacity: 0.7, scale: 0.95 }
                        ]}
                        android_ripple={{ color: theme.text + '20', borderless: true }}
                    >
                        <IconSymbol name="xmark" color={theme.text} size={20} />
                    </Pressable>
                    <ThemedText style={styles.headerTitle}>Voice Settings</ThemedText>
                </View>
            </View>

            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                <ThemedText colorName="muted" style={{ marginBottom: 24 }}>
                    Select a voice for your project generation.
                </ThemedText>

                <View style={styles.voiceGrid}>
                    {OFFICIAL_VOICES.map((voice) => {
                        const isSelected = selectedVoiceId === voice.id;
                        return (
                            <Pressable
                                key={voice.id}
                                style={[
                                    styles.voiceCard,
                                    { backgroundColor: theme.surface, borderColor: isSelected ? theme.primary : theme.border },
                                    isSelected && { borderWidth: 2 }
                                ]}
                                onPress={() => setSelectedVoiceId(voice.id)}
                            >
                                <View style={[styles.voiceIcon, { backgroundColor: isSelected ? theme.primary + '15' : theme.secondary }]}>
                                    <IconSymbol name="mic.fill" color={isSelected ? theme.primary : theme.muted} size={20} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <ThemedText style={[styles.voiceName, isSelected && { color: theme.primary }]}>
                                        {voice.name}
                                    </ThemedText>
                                    <ThemedText type="small" colorName="muted">{voice.gender}</ThemedText>
                                </View>
                                {isSelected && (
                                    <View style={[styles.checkBadge, { backgroundColor: theme.primary }]}>
                                        <IconSymbol name="checkmark" color="#FFF" size={10} />
                                    </View>
                                )}
                            </Pressable>
                        );
                    })}
                </View>

                {/* Placeholder for other settings */}
                <View style={{ marginTop: 32 }}>
                    <ThemedText type="subtitle" style={{ marginBottom: 16 }}>Advanced Parameters</ThemedText>
                    <View style={[styles.placeholder, { backgroundColor: theme.secondary, borderColor: theme.border }]}>
                        <ThemedText type="small" colorName="muted">Speech rate and pitch controls coming soon</ThemedText>
                    </View>
                </View>
            </ScrollView>

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
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        paddingTop: 4,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    body: {
        flex: 1,
        paddingHorizontal: 20,
    },
    voiceGrid: {
        gap: 10,
    },
    voiceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
        position: 'relative',
    },
    voiceIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    voiceName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    checkBadge: {
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholder: {
        height: 80,
        borderRadius: 16,
        borderStyle: 'dashed',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    doneBtn: {
        height: 56,
        marginHorizontal: 24,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    doneBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
