import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../hooks/useTheme';
import type { RootStackParamList } from '../navigation/types';

type MainSection = 'home' | 'cardio' | 'nutrition';
type MainNavigation = NativeStackNavigationProp<RootStackParamList>;

interface MainSectionTabsProps {
  active: MainSection;
}

const TABS: ReadonlyArray<{
  id: MainSection;
  label: string;
  route: 'Home' | 'Cardio' | 'Nutrition';
}> = [
  { id: 'home', label: 'Entrenamiento', route: 'Home' },
  { id: 'cardio', label: 'Cardio', route: 'Cardio' },
  { id: 'nutrition', label: 'Nutrición', route: 'Nutrition' },
];

export function MainSectionTabs({ active }: MainSectionTabsProps) {
  const navigation = useNavigation<MainNavigation>();
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          gap: 4,
          marginHorizontal: 16,
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
          paddingHorizontal: 4,
          alignItems: 'center',
        },
        tabActive: {
          backgroundColor: colors.surface,
        },
        label: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.textMuted,
          textAlign: 'center',
        },
        labelActive: {
          color: colors.text,
        },
      }),
    [colors]
  );

  return (
    <View style={styles.row}>
      {TABS.map((tab) => {
        const isActive = active === tab.id;

        return (
          <Pressable
            key={tab.id}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => {
              if (!isActive) {
                navigation.navigate(tab.route);
              }
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
          >
            <Text
              style={[styles.label, isActive && styles.labelActive]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
