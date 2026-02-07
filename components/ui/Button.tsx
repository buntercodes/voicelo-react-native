import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { ActivityIndicator, Pressable, PressableProps, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { ThemedText } from '../themed-text';

type ButtonProps = PressableProps & {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'white';
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
};

export function Button({
    title,
    variant = 'primary',
    loading = false,
    style,
    textStyle,
    icon,
    onPress,
    disabled,
    ...props
}: ButtonProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const getBackgroundColor = () => {
        if (disabled) return theme.muted + '40';
        switch (variant) {
            case 'primary': return theme.primary;
            case 'secondary': return theme.secondary;
            case 'outline': return 'transparent';
            case 'ghost': return 'transparent';
            case 'white': return '#FFFFFF';
            default: return theme.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return theme.muted;
        switch (variant) {
            case 'primary': return '#FFFFFF';
            case 'secondary': return theme.text;
            case 'outline': return theme.primary;
            case 'ghost': return theme.muted;
            case 'white': return '#000000';
            default: return '#FFFFFF';
        }
    };

    const handlePress = (e: any) => {
        if (loading || disabled) return;
        if (variant === 'primary') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress?.(e);
    };

    return (
        <Pressable
            style={[
                styles.button,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: variant === 'outline' || variant === 'white' ? theme.border : 'transparent',
                    borderWidth: variant === 'outline' || variant === 'white' ? 1 : 0,
                },
                style,
            ]}
            onPress={handlePress}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <ThemedText
                        type="defaultSemiBold"
                        style={[
                            { color: getTextColor() },
                            textStyle
                        ]}
                    >
                        {title}
                    </ThemedText>
                </>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 52,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    iconContainer: {
        marginRight: 12,
    },
});
