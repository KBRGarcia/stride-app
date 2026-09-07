import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { NutritionGuideContent } from './NutritionGuideContent';
import { useTheme } from '../hooks/useTheme';
import type { NutritionGuide } from '../models/types';

interface NutritionPanelProps {
  guide: NutritionGuide | null;
  title: string;
  subtitle: string;
  emptyMessage?: string;
}

export function NutritionPanel({
  guide,
  title,
  subtitle,
  emptyMessage = 'Completa la configuración inicial para ver las recomendaciones de nutrición.',
}: NutritionPanelProps) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        header: {
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 8,
        },
        title: {
          fontSize: 28,
          fontWeight: '700',
          color: colors.text,
        },
        subtitle: {
          marginTop: 6,
          fontSize: 15,
          color: colors.textMuted,
          lineHeight: 22,
        },
        content: {
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 32,
        },
        centerContent: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        },
        emptyText: {
          fontSize: 15,
          color: colors.textMuted,
          textAlign: 'center',
          lineHeight: 22,
        },
      }),
    [colors]
  );

  if (!guide) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <NutritionGuideContent guide={guide} />
      </ScrollView>
    </>
  );
}
