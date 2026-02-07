import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { APPWRITE_CONFIG } from '@/constants/appwrite';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { databases } from '@/lib/appwrite';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Query } from 'react-native-appwrite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function HomeActionItem({ icon, label, color }: { icon: any; label: string; color: string }) {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    return (
        <Pressable
            style={({ pressed }) => [
                styles.actionItem,
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
            ]}
            android_ripple={{ color: color + '30', borderless: false }}
        >
            <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
                <IconSymbol name={icon} color={color} size={28} />
            </View>
            <ThemedText type="small" style={{ marginTop: 8 }}>{label}</ThemedText>
        </Pressable>
    );
}

function ProjectRow({ id, name, createdAt, theme }: { id: string; name: string; createdAt: string; theme: any }) {
    const router = useRouter();
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.projectRow,
                pressed && { backgroundColor: theme.primary + '08' }
            ]}
            android_ripple={{ color: theme.primary + '15' }}
            onPress={() => router.push({ pathname: '/project/[id]', params: { id, name } })}>
            <View style={[styles.projectIconContainer, { backgroundColor: theme.primary + '10' }]}>
                <IconSymbol name="folder.fill" color={theme.primary} size={22} />
            </View>
            <View style={styles.projectInfo}>
                <ThemedText type="defaultSemiBold" numberOfLines={1}>{name}</ThemedText>
                <ThemedText type="small" colorName="muted" numberOfLines={1} style={{ marginTop: 2 }}>
                    Created on {formatDate(createdAt)}
                </ThemedText>
            </View>
            <Pressable
                style={({ pressed }) => [
                    styles.moreButton,
                    pressed && { opacity: 0.5 }
                ]}
                android_ripple={{ color: theme.muted + '20', borderless: true, radius: 20 }}
                onPress={() => Alert.alert('Project Actions', 'Menu opening...')}
            >
                <IconSymbol name="ellipsis" color={theme.muted} size={20} />
            </Pressable>
        </Pressable>
    );
}

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const router = useRouter();
    const { logout, user } = useAuth();
    const [projects, setProjects] = useState<any[]>([]);
    const [isProjectsLoading, setIsProjectsLoading] = useState(true);
    const [showAccountModal, setShowAccountModal] = useState(false);
    const accountScale = React.useRef(new Animated.Value(0)).current;

    const toggleAccountModal = (show: boolean) => {
        if (show) {
            setShowAccountModal(true);
            Animated.spring(accountScale, {
                toValue: 1,
                useNativeDriver: true,
                tension: 50,
                friction: 7
            }).start();
        } else {
            Animated.timing(accountScale, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true
            }).start(() => setShowAccountModal(false));
        }
    };

    const fetchProjects = async () => {
        if (!user?.$id) return;
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.PROJECTS_COLLECTION_ID,
                [
                    Query.equal('userId', user.$id),
                    Query.orderDesc('$createdAt'),
                    Query.limit(5)
                ]
            );
            setProjects(response.documents);
        } catch (error) {
            console.error('Fetch projects error:', error);
        } finally {
            setIsProjectsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [user?.$id]);

    const handleLogout = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Log Out", style: "destructive", onPress: logout }
            ]
        );
    };

    return (
        <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.staticContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <IconSymbol name="house.fill" color={theme.text} size={26} />
                        <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }}>VoiceLo</ThemedText>
                    </View>
                    <View style={styles.headerIcons}>
                        <Pressable
                            onPress={handleLogout}
                            style={({ pressed }) => [
                                styles.iconButton,
                                { backgroundColor: theme.secondary },
                                pressed && { opacity: 0.7, scale: 0.95 }
                            ]}
                            android_ripple={{ color: theme.text + '20', borderless: true }}
                        >
                            <IconSymbol name="rectangle.portrait.and.arrow.right" color={theme.text} size={18} />
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [
                                styles.iconButton,
                                { backgroundColor: theme.secondary },
                                pressed && { opacity: 0.7, scale: 0.95 }
                            ]}
                            android_ripple={{ color: theme.text + '20', borderless: true }}
                            onPress={() => toggleAccountModal(true)}
                        >
                            <LinearGradient
                                colors={[theme.primary, '#8B5CF6', '#10B981']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.gradientBorder}
                            >
                                <View style={[styles.avatarInner, { backgroundColor: theme.secondary }]}>
                                    {(user?.prefs as any)?.avatar ? (
                                        <Image
                                            source={{ uri: (user?.prefs as any).avatar }}
                                            style={{ width: '100%', height: '100%' }}
                                            contentFit="cover"
                                            transition={200}
                                        />
                                    ) : (
                                        <IconSymbol name="person.crop.circle.fill" color={theme.text} size={16} />
                                    )}
                                </View>
                            </LinearGradient>
                        </Pressable>
                    </View>
                </View>

                {/* Hero Card */}
                <ThemedView colorName="primary" style={styles.heroCard}>
                    <View style={styles.heroContent}>
                        <ThemedText style={{ color: '#FFF' }} type="title">
                            {(((user?.prefs as any)?.creditsTotal || 0) - ((user?.prefs as any)?.creditsUsed || 0)).toLocaleString()}
                        </ThemedText>
                        <ThemedText style={{ color: 'rgba(255,255,255,0.8)' }}>Credits Remaining</ThemedText>
                    </View>
                    <Pressable
                        style={({ pressed }) => [
                            styles.topUpButton,
                            pressed && { backgroundColor: '#F0F0F0', opacity: 0.9 }
                        ]}
                        android_ripple={{ color: theme.primary + '20' }}
                    >
                        <ThemedText style={{ color: theme.primary }} type="defaultSemiBold">Top Up</ThemedText>
                    </Pressable>
                </ThemedView>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleContainer}>
                            <IconSymbol name="wand.and.stars" color={theme.primary} size={18} />
                            <ThemedText type="defaultSemiBold">Quick Actions</ThemedText>
                        </View>
                    </View>
                    <View style={styles.actionGrid}>
                        <HomeActionItem
                            icon="mic.fill"
                            label="Voiceover"
                            color={theme.primary}
                        />
                        <HomeActionItem
                            icon="plus.circle.fill"
                            label="Clone Voice"
                            color="#10B981"
                        />
                        <HomeActionItem
                            icon="pencil"
                            label="AI Writer"
                            color="#8B5CF6"
                        />
                    </View>
                </View>

                {/* Recent Section - This part will now take available space and be the only scrollable area */}
                <View style={[styles.section, { flex: 1, marginBottom: 0 }]}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleContainer}>
                            <IconSymbol name="clock.fill" color={theme.primary} size={18} />
                            <ThemedText type="defaultSemiBold">Recent Projects</ThemedText>
                        </View>
                        <Pressable
                            style={({ pressed }) => [
                                styles.seeAllBadge,
                                pressed && { opacity: 0.6 }
                            ]}
                            android_ripple={{ color: theme.primary + '20' }}
                            onPress={() => router.push('/manage-projects')}
                        >
                            <ThemedText style={styles.seeAllText}>See All</ThemedText>
                            <IconSymbol name="chevron.right" color={theme.primary} size={14} />
                        </Pressable>
                    </View>
                    {isProjectsLoading ? (
                        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                            <ActivityIndicator color={theme.primary} />
                        </View>
                    ) : projects.length === 0 ? (
                        <ThemedView colorName="surface" style={styles.emptyState}>
                            <ThemedText colorName="muted" type="small">No projects found. Create your first one!</ThemedText>
                        </ThemedView>
                    ) : (
                        <View style={styles.projectListContainer}>
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                style={styles.projectList}
                                contentContainerStyle={{ paddingBottom: 20 }}>
                                {projects.map((project, index) => (
                                    <React.Fragment key={project.$id}>
                                        <ProjectRow
                                            id={project.$id}
                                            name={project.name}
                                            createdAt={project.$createdAt}
                                            theme={theme}
                                        />
                                        {index < projects.length - 1 && <View style={styles.separator} />}
                                    </React.Fragment>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </View>

            {/* Account Modal */}
            <Modal
                visible={showAccountModal}
                transparent={true}
                animationType="none"
                onRequestClose={() => toggleAccountModal(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => toggleAccountModal(false)}
                >
                    <Animated.View
                        style={[
                            styles.accountModalContent,
                            {
                                transform: [{ scale: accountScale }],
                                opacity: accountScale,
                                backgroundColor: theme.surface
                            }
                        ]}
                    >
                        <Pressable style={{ padding: 20 }} onPress={(e) => e.stopPropagation()}>
                            <View style={styles.modalUserHeader}>
                                <LinearGradient
                                    colors={[theme.primary, '#8B5CF6', '#10B981']}
                                    style={styles.modalAvatarBorder}
                                >
                                    <View style={[styles.modalAvatarInner, { backgroundColor: theme.secondary }]}>
                                        {(user?.prefs as any)?.avatar ? (
                                            <Image
                                                source={{ uri: (user?.prefs as any).avatar }}
                                                style={{ width: '100%', height: '100%' }}
                                            />
                                        ) : (
                                            <IconSymbol name="person.fill" color={theme.text} size={24} />
                                        )}
                                    </View>
                                </LinearGradient>
                                <View style={{ flex: 1 }}>
                                    <ThemedText type="defaultSemiBold">{user?.name || 'User'}</ThemedText>
                                    <ThemedText type="small" colorName="muted">{user?.email}</ThemedText>
                                </View>
                            </View>

                            <View style={styles.modalDivider} />

                            <View style={styles.modalMenu}>
                                <Pressable style={styles.modalMenuItem} android_ripple={{ color: theme.primary + '10' }}>
                                    <IconSymbol name="person.fill" color={theme.primary} size={20} />
                                    <ThemedText style={{ flex: 1 }}>Profile</ThemedText>
                                    <IconSymbol name="chevron.right" color={theme.muted} size={14} />
                                </Pressable>
                                <Pressable style={styles.modalMenuItem} android_ripple={{ color: theme.primary + '10' }}>
                                    <IconSymbol name="gearshape.fill" color={theme.primary} size={20} />
                                    <ThemedText style={{ flex: 1 }}>Settings</ThemedText>
                                    <IconSymbol name="chevron.right" color={theme.muted} size={14} />
                                </Pressable>
                                <Pressable style={styles.modalMenuItem} android_ripple={{ color: theme.primary + '10' }}>
                                    <IconSymbol name="questionmark.circle.fill" color={theme.primary} size={20} />
                                    <ThemedText style={{ flex: 1 }}>Help & Support</ThemedText>
                                    <IconSymbol name="chevron.right" color={theme.muted} size={14} />
                                </Pressable>
                                <Pressable
                                    style={styles.modalMenuItem}
                                    android_ripple={{ color: theme.primary + '10' }}
                                    onPress={() => {
                                        toggleAccountModal(false);
                                        router.push('/privacy-policy');
                                    }}
                                >
                                    <IconSymbol name="shield.fill" color={theme.primary} size={20} />
                                    <ThemedText style={{ flex: 1 }}>Privacy Policy</ThemedText>
                                    <IconSymbol name="chevron.right" color={theme.muted} size={14} />
                                </Pressable>
                            </View>

                            <Pressable
                                style={[styles.modalLogoutBtn, { backgroundColor: '#FF3B3015' }]}
                                onPress={() => {
                                    toggleAccountModal(false);
                                    handleLogout();
                                }}
                            >
                                <IconSymbol name="rectangle.portrait.and.arrow.right" color="#FF3B30" size={18} />
                                <ThemedText style={{ color: '#FF3B30', fontWeight: 'bold' }}>Log Out</ThemedText>
                            </Pressable>
                        </Pressable>
                    </Animated.View>
                </Pressable>
            </Modal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    staticContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    gradientBorder: {
        width: '100%',
        height: '100%',
        padding: 1.5, // The width of the border
        borderRadius: 16,
    },
    avatarInner: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroCard: {
        padding: 24,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#0066FF',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    heroContent: {
        gap: 4,
    },
    topUpButton: {
        backgroundColor: '#FFF',
        paddingVertical: 12,
        paddingHorizontal: 22,
        borderRadius: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    actionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    actionItem: {
        flex: 1,
        alignItems: 'center',
    },
    actionIcon: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    horizontalScroll: {
        marginHorizontal: -20,
    },
    horizontalScrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 12, // Room for shadow
    },
    voiceCard: {
        width: 150,
        padding: 20,
        borderRadius: 28,
        marginRight: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, // Increased slightly for visibility
        shadowRadius: 12,
        elevation: 4,
    },
    avatarPlaceholder: {
        width: 52,
        height: 52,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tag: {
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginTop: 12,
    },
    emptyState: {
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'rgba(0,0,0,0.1)',
    },
    projectListContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 24,
        overflow: 'hidden',
    },
    projectList: {
        flex: 1,
    },
    projectRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12,
    },
    projectIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    projectInfo: {
        flex: 1,
    },
    moreButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginHorizontal: 12,
    },
    seeAllBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 102, 255, 0.08)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 4,
    },
    seeAllText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0066FF',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    accountModalContent: {
        width: '100%',
        maxWidth: 320,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    modalUserHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
    },
    modalAvatarBorder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        padding: 2,
    },
    modalAvatarInner: {
        width: '100%',
        height: '100%',
        borderRadius: 26,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalDivider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 16,
    },
    modalMenu: {
        gap: 4,
        marginBottom: 20,
    },
    modalMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        gap: 12,
        borderRadius: 12,
    },
    modalLogoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 8,
        borderRadius: 16,
    }
});
