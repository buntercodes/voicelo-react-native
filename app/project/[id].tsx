import { AudioPlayerModal } from '@/components/AudioPlayerModal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { OFFICIAL_VOICES, useSettings } from '@/context/SettingsContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { synthesizeInworldSpeech } from '@/services/tts-service';
import * as FileSystem from 'expo-file-system/legacy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function ProjectScreen() {
    const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { selectedVoiceId } = useSettings();

    const [text, setText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [showPlayer, setShowPlayer] = useState(false);

    const settingsScale = useRef(new Animated.Value(1)).current;

    const displayName = String(name || 'Project Details');
    const selectedVoice = OFFICIAL_VOICES.find(v => v.id === selectedVoiceId) || OFFICIAL_VOICES[0];

    const handleSettingsPress = () => {
        Animated.sequence([
            Animated.timing(settingsScale, {
                toValue: 0.92,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(settingsScale, {
                toValue: 1,
                duration: 50,
                useNativeDriver: true,
            }),
        ]).start(() => {
            router.push('/voice-settings');
        });
    };

    const handleGenerate = async () => {
        if (!text) return;

        setIsGenerating(true);
        try {
            const audioBase64 = await synthesizeInworldSpeech(text, selectedVoice.id);

            const fileUri = `${FileSystem.cacheDirectory}tts_project_${id}.mp3`;
            await FileSystem.writeAsStringAsync(fileUri, audioBase64, {
                encoding: 'base64' as any,
            });

            setAudioUri(`${fileUri}?t=${Date.now()}`);
            setShowPlayer(true);

        } catch (error: any) {
            console.error("Generation error:", error);
            Alert.alert("Error", error.message || "Failed to generate speech.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
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
                        <IconSymbol name="chevron.left" color={theme.text} size={20} />
                    </Pressable>
                    <ThemedText style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
                        {displayName}
                    </ThemedText>
                </View>
                <Pressable
                    onPress={() => { }}
                    style={({ pressed }) => [
                        styles.headerBtn,
                        { backgroundColor: theme.primary + (pressed ? '25' : '15') }
                    ]}
                >
                    <IconSymbol name="doc.text" size={14} color={theme.primary} />
                    <ThemedText style={[styles.headerBtnText, { color: theme.primary }]}>Import</ThemedText>
                </Pressable>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.editorArea}>
                    <TextInput
                        multiline
                        placeholder="Write or paste your script here..."
                        placeholderTextColor={theme.muted + '80'}
                        style={[styles.textInput, { color: theme.text }]}
                        value={text}
                        onChangeText={setText}
                        textAlignVertical="top"
                        selectionColor={theme.primary}
                    />
                    <View style={styles.counterContainer}>
                        {audioUri && (
                            <Pressable onPress={() => setShowPlayer(true)} style={{ marginRight: 12 }}>
                                <IconSymbol name="play.circle.fill" color={theme.primary} size={20} />
                            </Pressable>
                        )}
                        <ThemedText style={[styles.counterText, { color: theme.muted }]}>
                            {text.length.toLocaleString()} characters • {selectedVoice.name}
                        </ThemedText>
                    </View>
                </View>

                <View
                    style={[
                        styles.bottomNavBar,
                        { backgroundColor: theme.surface, borderTopColor: theme.border }
                    ]}
                >
                    <View style={styles.navContent}>
                        <Animated.View style={{ transform: [{ scale: settingsScale }] }}>
                            <Pressable style={styles.navItem} onPress={handleSettingsPress}>
                                <IconSymbol name="slider.horizontal.3" color={theme.muted} size={24} />
                                <ThemedText style={styles.navLabel} colorName="muted">Settings</ThemedText>
                            </Pressable>
                        </Animated.View>

                        <View style={styles.centerAction}>
                            <Pressable
                                style={[
                                    styles.generateFab,
                                    { backgroundColor: theme.primary },
                                    (!text || isGenerating) && { opacity: 0.6 }
                                ]}
                                onPress={handleGenerate}
                                disabled={!text || isGenerating}
                            >
                                {isGenerating ? (
                                    <ActivityIndicator color="#FFF" size="small" />
                                ) : (
                                    <>
                                        <IconSymbol name="plus" color="#FFF" size={20} />
                                        <ThemedText style={styles.generateBtnText}>Generate</ThemedText>
                                    </>
                                )}
                            </Pressable>
                        </View>

                        <Pressable style={styles.navItem} onPress={() => { }}>
                            <IconSymbol name="clock.fill" color={theme.muted} size={24} />
                            <ThemedText style={styles.navLabel} colorName="muted">History</ThemedText>
                        </Pressable>
                    </View>
                    <View style={{ height: Math.max(insets.bottom, 12) }} />
                </View>
            </KeyboardAvoidingView>

            <AudioPlayerModal
                visible={showPlayer}
                onClose={() => setShowPlayer(false)}
                audioSource={audioUri}
                voiceName={selectedVoice.name}
            />
        </ThemedView>
    );
}

export default ProjectScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 8,
        paddingTop: 4,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
        marginRight: 12,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    editorArea: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    textInput: {
        flex: 1,
        fontSize: 18,
        lineHeight: 28,
        fontWeight: '400',
    },
    bottomNavBar: {
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.05,
                shadowRadius: 5,
            },
            android: {
                elevation: 16,
            },
        }),
    },
    navContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 70,
        paddingHorizontal: 8,
        gap: 8,
    },
    navItem: {
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    centerAction: {
        flex: 1,
    },
    generateFab: {
        width: '100%',
        height: 48,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#0066FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    generateBtnText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '800',
    },
    navLabel: {
        fontSize: 10,
        fontWeight: '700',
    },
    headerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 4,
    },
    headerBtnText: {
        fontSize: 11,
        fontWeight: '700',
    },
    counterContainer: {
        position: 'absolute',
        bottom: 12,
        right: 20,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
    },
    counterText: {
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.8,
    },
});
