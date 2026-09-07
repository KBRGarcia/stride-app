import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../hooks/useTheme';

export interface SubmenuOption<T extends string> {
  id: T;
  label: string;
}

interface SectionSubmenuProps<T extends string> {
  options: ReadonlyArray<SubmenuOption<T>>;
  active: T;
  onChange: (id: T) => void;
}

export function SectionSubmenu<T extends string>({
  options,
  active,
  onChange,
}: SectionSubmenuProps<T>) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          gap: 8,
          marginHorizontal: 24,
          marginTop: 8,
          marginBottom: 4,
        },
        option: {
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
        },
        optionActive: {
          borderColor: colors.primary,
          backgroundColor: colors.primary,
        },
        label: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.textSecondary,
        },
        labelActive: {
          color: colors.primaryText,
        },
      }),
    [colors]
  );

  return (
    <View style={styles.row}>
      {options.map((option) => {
        const isActive = option.id === active;

        return (
          <Pressable
            key={option.id}
            style={[styles.option, isActive && styles.optionActive]}
            onPress={() => onChange(option.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={option.label}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
