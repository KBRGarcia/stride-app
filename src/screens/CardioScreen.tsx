import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../components/AppShell';
import { MainSectionTabs } from '../components/MainSectionTabs';
import { NutritionPanel } from '../components/NutritionPanel';
import { SectionSubmenu } from '../components/SectionSubmenu';
import { useTheme } from '../hooks/useTheme';
import type { CardioActivityId } from '../models/types';
import type { RootStackParamList } from '../navigation/types';
import { getCardioActivities } from '../utils/cardioData';
import { getCardioNutritionGuide } from '../utils/nutritionData';

type CardioNavigation = NativeStackNavigationProp<RootStackParamList, 'Cardio'>;
type CardioSubmenu = 'activities' | 'nutrition';

const ACTIVITY_ICONS: Record<CardioActivityId, string> = {
  jog: 'walk-outline',
  cycling: 'bicycle-outline',
  'rope-jump': 'pulse-outline',
};

const CARDIO_SUBMENU: ReadonlyArray<{ id: CardioSubmenu; label: string }> = [
  { id: 'activities', label: 'Actividades' },
  { id: 'nutrition', label: 'Nutrición' },
];

export default function CardioScreen() {
  const navigation = useNavigation<CardioNavigation>();
  const { colors } = useTheme();
  const [submenu, setSubmenu] = useState<CardioSubmenu>('activities');
  const activities = getCardioActivities();
  const nutritionGuide = getCardioNutritionGuide();

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
        card: {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
        },
        cardHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        cardTitleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          flex: 1,
          paddingRight: 8,
        },
        cardTitle: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
        },
        cardMeta: {
          marginTop: 6,
          marginLeft: 34,
          fontSize: 13,
          color: colors.textMuted,
        },
      }),
    [colors]
  );

  return (
    <AppShell>
      <MainSectionTabs active="cardio" />
      <SectionSubmenu options={CARDIO_SUBMENU} active={submenu} onChange={setSubmenu} />

      {submenu === 'nutrition' ? (
        <NutritionPanel
          guide={nutritionGuide}
          title="Nutrición"
          subtitle="Guía de reducción de grasa asociada al cardio"
        />
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Cardio</Text>
            <Text style={styles.subtitle}>Elige una actividad para ver el plan semanal.</Text>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {activities.map((activity) => (
              <Pressable
                key={activity.id}
                style={styles.card}
                onPress={() =>
                  navigation.navigate('CardioActivity', { activityId: activity.id })
                }
                accessibilityRole="button"
                accessibilityLabel={activity.title}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Ionicons
                      name={ACTIVITY_ICONS[activity.id]}
                      size={24}
                      color={colors.primary}
                    />
                    <Text style={styles.cardTitle}>{activity.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </View>
                <Text style={styles.cardMeta}>{activity.duracionEstimada}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}
    </AppShell>
  );
}
