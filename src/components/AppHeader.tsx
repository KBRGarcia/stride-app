import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../hooks/useTheme';
import { useThemeStore } from '../stores/useThemeStore';

export function AppHeader() {
  const { colors, images, isDark } = useTheme();
  const toggleColorScheme = useThemeStore((state) => state.toggleColorScheme);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.headerBackground,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.brand}>
        <Image
          source={images.logoIcon}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Logo de Stride"
        />
        <Image
          source={images.logoName}
          style={styles.name}
          resizeMode="contain"
          accessibilityLabel="Stride"
        />
      </View>

      <Pressable
        style={[styles.toggleButton, { backgroundColor: colors.surfaceSecondary }]}
        onPress={() => void toggleColorScheme()}
        accessibilityRole="button"
        accessibilityLabel={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      >
        <Ionicons
          name={isDark ? 'sunny-outline' : 'moon-outline'}
          size={22}
          color={colors.text}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 12,
  },
  logo: {
    width: 40,
    height: 40,
  },
  name: {
    width: 120,
    height: 30,
    marginLeft: -35,
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
