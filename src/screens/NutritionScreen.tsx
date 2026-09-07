import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../components/AppShell';
import { MainSectionTabs } from '../components/MainSectionTabs';
import { NutritionGuideContent } from '../components/NutritionGuideContent';
import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../stores/useAppStore';
import { getNutritionGuide, NUTRITION_GOAL_TITLES } from '../utils/nutritionData';

export default function NutritionScreen() {
  const profile = useAppStore((state) => state.profile);
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
        errorTitle: {
          fontSize: 22,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 8,
          textAlign: 'center',
        },
        errorText: {
          fontSize: 15,
          color: colors.textMuted,
          textAlign: 'center',
          lineHeight: 22,
        },
      }),
    [colors]
  );

  if (!profile) {
    return (
      <AppShell>
        <MainSectionTabs active="nutrition" />
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>Sin perfil configurado</Text>
          <Text style={styles.errorText}>
            Completa la configuración inicial para ver las recomendaciones de nutrición.
          </Text>
        </View>
      </AppShell>
    );
  }

  const guide = getNutritionGuide(profile.goal);

  return (
    <AppShell>
      <MainSectionTabs active="nutrition" />
      <View style={styles.header}>
        <Text style={styles.title}>Nutrición</Text>
        <Text style={styles.subtitle}>
          Guía para {NUTRITION_GOAL_TITLES[profile.goal].toLowerCase()}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <NutritionGuideContent guide={guide} />
      </ScrollView>
    </AppShell>
  );
}
