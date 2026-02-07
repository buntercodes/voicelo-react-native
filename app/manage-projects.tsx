import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { APPWRITE_CONFIG } from '@/constants/appwrite';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { databases } from '@/lib/appwrite';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Keyboard,
    Platform,
    Pressable,
    RefreshControl,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import { Query } from 'react-native-appwrite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Project {
    $id: string;
    name: string;
    $createdAt: string;
    userId: string;
}

export default function ManageProjectsScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const router = useRouter();

    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchProjects = async (showLoading = true) => {
        if (!user?.$id) return;
        if (showLoading) setIsLoading(true);
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.PROJECTS_COLLECTION_ID,
                [
                    Query.equal('userId', user.$id),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100) // Fetch a reasonable amount for the manage screen
                ]
            );
            const docs = response.documents as unknown as Project[];
            setProjects(docs);
            setFilteredProjects(docs);
        } catch (error) {
            console.error('Fetch projects error:', error);
            Alert.alert('Error', 'Failed to fetch projects. Please try again.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [user?.$id]);

    useEffect(() => {
        const filtered = projects.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredProjects(filtered);
    }, [searchQuery, projects]);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchProjects(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleDeleteProject = (id: string, name: string) => {
        Alert.alert(
            'Delete Project',
            `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await databases.deleteDocument(
                                APPWRITE_CONFIG.DATABASE_ID,
                                APPWRITE_CONFIG.PROJECTS_COLLECTION_ID,
                                id
                            );
                            fetchProjects(false);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete project.');
                        }
                    }
                }
            ]
        );
    };

    const renderProjectItem = ({ item }: { item: Project }) => (
        <Pressable
            style={({ pressed }) => [
                styles.projectCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
                pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 }
            ]}
            onPress={() => router.push({ pathname: '/project/[id]', params: { id: item.$id, name: item.name } })}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '10' }]}>
                <IconSymbol name="folder.fill" color={theme.primary} size={24} />
            </View>
            <View style={styles.projectDetails}>
                <ThemedText type="defaultSemiBold" numberOfLines={1}>{item.name}</ThemedText>
                <ThemedText type="small" colorName="muted" style={{ marginTop: 2 }}>
                    Created on {formatDate(item.$createdAt)}
                </ThemedText>
            </View>
            <View style={styles.cardActions}>
                <Pressable
                    onPress={() => handleDeleteProject(item.$id, item.name)}
                    style={({ pressed }) => [
                        styles.actionButton,
                        pressed && { opacity: 0.5 }
                    ]}
                    hitSlop={8}
                >
                    <IconSymbol name="trash.fill" color="#FF3B30" size={20} />
                </Pressable>
                <IconSymbol name="chevron.right" color={theme.muted} size={16} />
            </View>
        </Pressable>
    );

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: 'Manage Projects',
                    headerLargeTitle: true,
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: theme.background },
                    headerTintColor: theme.text,
                }}
            />

            <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <IconSymbol name="magnifyingglass" color={theme.muted} size={18} />
                <TextInput
                    placeholder="Search projects..."
                    placeholderTextColor={theme.muted + '80'}
                    style={[styles.searchInput, { color: theme.text }]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    clearButtonMode="while-editing"
                />
                {searchQuery !== '' && (
                    <Pressable onPress={() => setSearchQuery('')}>
                        <IconSymbol name="xmark" color={theme.muted} size={16} />
                    </Pressable>
                )}
            </View>

            {isLoading && !isRefreshing ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : filteredProjects.length === 0 ? (
                <View style={styles.centerContainer}>
                    <IconSymbol name="folder.fill" color={theme.muted + '30'} size={64} />
                    <ThemedText style={{ marginTop: 16, textAlign: 'center' }} colorName="muted">
                        {searchQuery ? `No projects matching "${searchQuery}"` : 'Your project library is empty'}
                    </ThemedText>
                </View>
            ) : (
                <FlatList
                    data={filteredProjects}
                    renderItem={renderProjectItem}
                    keyExtractor={item => item.$id}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.primary}
                            colors={[theme.primary]}
                        />
                    }
                    onScrollEndDrag={Keyboard.dismiss}
                />
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginVertical: 12,
        paddingHorizontal: 12,
        height: 48,
        borderRadius: 14,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    projectCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    projectDetails: {
        flex: 1,
        marginLeft: 16,
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
