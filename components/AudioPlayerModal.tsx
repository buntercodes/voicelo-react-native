import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';

interface AudioPlayerModalProps {
    visible: boolean;
    onClose: () => void;
    audioSource: string | null;
    voiceName: string;
}

export function AudioPlayerModal({ visible, onClose, audioSource, voiceName }: AudioPlayerModalProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const [isSharing, setIsSharing] = useState(false);

    // expo-audio player
    const player = useAudioPlayer(audioSource);
    const status = useAudioPlayerStatus(player);

    // Auto-play when modal becomes visible or source changes
    useEffect(() => {
        let isMounted = true;

        if (visible && audioSource) {
            // Small delay to ensure player is ready
            const timer = setTimeout(() => {
                if (isMounted) {
                    // Always start from beginning for new generation/opening
                    player.seekTo(0);
                    player.play();
                }
            }, 500);
            return () => {
                isMounted = false;
                clearTimeout(timer);
            };
        }
    }, [visible, audioSource, player]);

    useEffect(() => {
        if (!visible && player.playing) {
            player.pause();
        }
    }, [visible, player]);

    const handleTogglePlayback = () => {
        if (player.playing) {
            player.pause();
        } else {
            // Check if we are at the end (or very close to it)
            const isFinished = status.currentTime >= (status.duration - 100);
            if (isFinished && status.duration > 0) {
                player.seekTo(0);
            }
            player.play();
        }
    };

    const handleRewind = () => {
        const newPos = Math.max(0, status.currentTime - 5000);
        player.seekTo(newPos);
    };

    const handleForward = () => {
        const newPos = Math.min(status.duration, status.currentTime + 5000);
        player.seekTo(newPos);
    };

    const handleShare = async () => {
        if (!audioSource) return;

        // Strip query params if they exist (added for cache busting)
        const cleanPath = audioSource.split('?')[0];

        try {
            setIsSharing(true);
            const isAvailable = await Sharing.isAvailableAsync();
            if (!isAvailable) {
                Alert.alert("Error", "Sharing is not available on this device.");
                return;
            }

            await Sharing.shareAsync(cleanPath, {
                mimeType: 'audio/mpeg',
                dialogTitle: `Share ${voiceName} Audio`,
                UTI: 'public.mp3',
            });
        } catch (error) {
            console.error("Sharing error:", error);
            Alert.alert("Error", "Failed to share audio file.");
        } finally {
            setIsSharing(false);
        }
    };

    const formatTime = (ms: number) => {
        const totalSecs = Math.floor(ms / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = status.duration > 0 ? (status.currentTime / status.duration) * 100 : 0;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <ThemedView style={[styles.content, { backgroundColor: theme.surface }]}>
                    <LinearGradient
                        colors={[theme.primary + '15', 'transparent']}
                        style={styles.gradientHeader}
                    />

                    <View style={styles.header}>
                        <ThemedText style={styles.title}>Preview Audio</ThemedText>
                        <Pressable onPress={onClose} style={styles.closeBtn}>
                            <IconSymbol name="xmark" color={theme.text} size={20} />
                        </Pressable>
                    </View>

                    <View style={styles.playerContainer}>
                        <View style={[styles.artworkContainer, { backgroundColor: theme.secondary }]}>
                            <IconSymbol name="waveform" color={theme.primary} size={48} />
                        </View>

                        <View style={styles.infoContainer}>
                            <ThemedText style={styles.trackTitle} type="subtitle">Generated Speech</ThemedText>
                            <ThemedText style={styles.voiceName} colorName="muted">{voiceName} Voice</ThemedText>
                        </View>

                        <View style={styles.progressArea}>
                            <View style={[styles.progressBar, { backgroundColor: theme.secondary }]}>
                                <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: theme.primary }]} />
                            </View>
                            <View style={styles.timeLabels}>
                                <ThemedText style={styles.timeLabel}>{formatTime(status.currentTime)}</ThemedText>
                                <ThemedText style={styles.timeLabel}>{formatTime(status.duration)}</ThemedText>
                            </View>
                        </View>

                        <View style={styles.controls}>
                            <Pressable onPress={handleRewind} style={styles.secondaryControl}>
                                <IconSymbol name="gobackward.5" color={theme.text} size={24} />
                            </Pressable>

                            <Pressable onPress={handleTogglePlayback} style={[styles.playBtn, { backgroundColor: theme.primary }]}>
                                <IconSymbol name={player.playing ? "pause.fill" : "play.fill"} color="#FFF" size={28} />
                            </Pressable>

                            <Pressable onPress={handleForward} style={styles.secondaryControl}>
                                <IconSymbol name="goforward.5" color={theme.text} size={24} />
                            </Pressable>
                        </View>
                    </View>

                    <Pressable
                        style={[styles.exportBtn, { backgroundColor: theme.secondary }]}
                        onPress={handleShare}
                        disabled={isSharing}
                    >
                        {isSharing ? (
                            <ActivityIndicator color={theme.text} size="small" />
                        ) : (
                            <>
                                <IconSymbol name="square.and.arrow.up" color={theme.text} size={18} />
                                <ThemedText style={styles.exportText}>Share Audio</ThemedText>
                            </>
                        )}
                    </Pressable>
                </ThemedView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    content: {
        width: '100%',
        borderRadius: 32,
        overflow: 'hidden',
        padding: 24,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    gradientHeader: {
        ...StyleSheet.absoluteFillObject,
        height: 120,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playerContainer: {
        alignItems: 'center',
    },
    artworkContainer: {
        width: 100,
        height: 100,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    infoContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    trackTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    voiceName: {
        fontSize: 14,
    },
    progressArea: {
        width: '100%',
        marginBottom: 32,
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
    },
    timeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    timeLabel: {
        fontSize: 12,
        opacity: 0.6,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        marginBottom: 40,
    },
    playBtn: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    secondaryControl: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    exportBtn: {
        height: 52,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    exportText: {
        fontWeight: '600',
    },
});
