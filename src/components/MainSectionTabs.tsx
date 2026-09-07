import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../hooks/useTheme';
import type { RootStackParamList } from '../navigation/types';

type MainSection = 'home' | 'nutrition';
type MainNavigation = NativeStackNavigationProp<RootStackParamList>;

interface MainSectionTabsProps {
  active: MainSection;
}

export function MainSectionTabs({ active }: MainSectionTabsProps) {
  const navigation = useNavigation<MainNavigation>();
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          gap: 8,
          marginHorizontal: 24,
          marginTop: 16,
          marginBottom: 4,
          padding: 4,
          borderRadius: 14,
          backgroundColor: colors.surfaceSecondary,
        },
        tab: {
          flex: 1,
          borderRadius: 10,
          paddingVertical: 10,
          alignItems: 'center',
        },
        tabActive: {
          backgroundColor: colors.surface,
        },
        label: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.textMuted,
        },
        labelActive: {
          color: colors.text,
        },
      }),
    [colors]
  );

  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.tab, active === 'home' && styles.tabActive]}
        onPress={() => {
          if (active !== 'home') {
            navigation.navigate('Home');
          }
        }}
        accessibilityRole="button"
        accessibilityState={{ selected: active === 'home' }}
        accessibilityLabel="Entrenamiento"
      >
        <Text style={[styles.label, active === 'home' && styles.labelActive]}>
          Entrenamiento
        </Text>
      </Pressable>
      <Pressable
        style={[styles.tab, active === 'nutrition' && styles.tabActive]}
        onPress={() => {
          if (active !== 'nutrition') {
            navigation.navigate('Nutrition');
          }
        }}
        accessibilityRole="button"
        accessibilityState={{ selected: active === 'nutrition' }}
        accessibilityLabel="Nutrición"
      >
        <Text style={[styles.label, active === 'nutrition' && styles.labelActive]}>
          Nutrición
        </Text>
      </Pressable>
    </View>
  );
}
