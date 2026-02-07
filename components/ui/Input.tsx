import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useState } from 'react';
import { Platform, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { ThemedText } from '../themed-text';

type InputProps = TextInputProps & {
    label?: string;
    error?: string;
};

export function Input({ label, error, style, ...props }: InputProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
            {label && (
                <ThemedText type="label" style={styles.label} colorName="muted">
                    {label}
                </ThemedText>
            )}
            <TextInput
                style={[
                    styles.input,
                    {
                        borderColor: error ? '#EF4444' : isFocused ? theme.primary : theme.border,
                        color: theme.text,
                        backgroundColor: theme.surface,
                    },
                    style,
                ]}
                placeholderTextColor={Colors[colorScheme].muted}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                {...props}
            />
            {error && (
                <ThemedText style={{ color: '#EF4444', marginTop: 4, fontSize: 12 }}>
                    {error}
                </ThemedText>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
});
