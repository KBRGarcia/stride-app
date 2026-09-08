import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../hooks/useTheme';
import { useThemeStore } from '../stores/useThemeStore';
import { ResetProfileButton } from './ResetProfileButton';

export function AppHeader() {
  const { colors, images, isDark } = useTheme();
  const toggleColorScheme = useThemeStore((state) => state.toggleColorScheme);
  const insets = useSafeAreaInsets();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

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
        style={[styles.menuButton, { backgroundColor: colors.surfaceSecondary }]}
        onPress={() => setIsMenuOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Abrir menú"
      >
        <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
      </Pressable>

      <Modal
        visible={isMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.overlay} onPress={closeMenu}>
          <Pressable
            style={[
              styles.menu,
              {
                top: insets.top + 56,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => undefined}
          >
            <ResetProfileButton onPress={closeMenu} />
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <Pressable
              style={styles.menuRow}
              onPress={() => {
                closeMenu();
                void toggleColorScheme();
              }}
              accessibilityRole="button"
              accessibilityLabel={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
            >
              <Ionicons
                name={isDark ? 'sunny-outline' : 'moon-outline'}
                size={20}
                color={colors.text}
              />
              <Text style={[styles.menuRowText, { color: colors.text }]}>
                {isDark ? 'Modo claro' : 'Modo oscuro'}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    right: 16,
    minWidth: 220,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuRowText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
