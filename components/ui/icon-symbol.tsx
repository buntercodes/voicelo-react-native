// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'arrow.left': 'arrow-back',
  'mic.fill': 'mic',
  'sparkles': 'auto-awesome',
  'pencil.and.outline': 'edit',
  'person.crop.circle.fill': 'account-circle',
  'gearshape.fill': 'settings',
  'plus.circle.fill': 'add-circle',
  'rectangle.portrait.and.arrow.right': 'logout',
  'ellipsis': 'more-vert',
  'folder.fill': 'folder',
  'clock.fill': 'history',
  'pencil': 'edit',
  'wand.and.stars': 'auto-fix-high',
  'slider.horizontal.3': 'tune',
  'arrow.down.doc': 'file-download',
  'doc.text': 'description',
  'xmark': 'close',
  'plus': 'add',
  'magnifyingglass': 'search',
  'trash.fill': 'delete-outline',
  'sun.max.fill': 'light-mode',
  'moon.fill': 'dark-mode',
  'circle.lefthalf.filled': 'brightness-6',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
