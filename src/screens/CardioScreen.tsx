import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../components/AppShell';
import { MainSectionTabs } from '../components/MainSectionTabs';
import { NutritionGuideContent } from '../components/NutritionGuideContent';
import { useTheme } from '../hooks/useTheme';
import type { CardioActivityId } from '../models/types';
import type { RootStackParamList } from '../navigation/types';
import { getCardioActivities } from '../utils/cardioData';
import { getCardioNutritionGuide } from '../utils/nutritionData';

type CardioNavigation = NativeStackNavigationProp<RootStackParamList, 'Cardio'>;

const ACTIVITY_ICONS: Record<CardioActivityId, string> = {
  jog: 'walk-outline',
  cycling: 'bicycle-outline',
  'rope-jump': 'pulse-outline',
};

export default function CardioScreen() {
  const navigation = useNavigation<CardioNavigation>();
  const { colors } = useTheme();
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
          marginBottom: 8,
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
        cardDescription: {
          fontSize: 14,
          color: colors.textSecondary,
          lineHeight: 20,
        },
        cardMeta: {
          marginTop: 10,
          fontSize: 13,
          fontWeight: '600',
          color: colors.primary,
        },
        sectionTitle: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
          marginTop: 12,
          marginBottom: 6,
        },
        sectionIntro: {
          fontSize: 14,
          color: colors.textMuted,
          lineHeight: 20,
          marginBottom: 14,
        },
      }),
    [colors]
  );

  return (
    <AppShell>
      <MainSectionTabs active="cardio" />
      <View style={styles.header}>
        <Text style={styles.title}>Cardio</Text>
        <Text style={styles.subtitle}>
          Planes de trote, ciclismo y salto de cuerda disponibles para cualquier perfil.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activities.map((activity) => (
          <Pressable
            key={activity.id}
            style={styles.card}
            onPress={() => navigation.navigate('CardioActivity', { activityId: activity.id })}
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
            <Text style={styles.cardDescription}>{activity.descripcion}</Text>
            <Text style={styles.cardMeta}>{activity.duracionEstimada}</Text>
          </Pressable>
        ))}

        <Text style={styles.sectionTitle}>Nutrición para cardio</Text>
        <Text style={styles.sectionIntro}>
          El cardio se asocia con la reducción de grasa. Esta guía aplica a las tres
          actividades, independientemente del objetivo elegido en el formulario.
        </Text>
        <NutritionGuideContent guide={nutritionGuide} />
      </ScrollView>
    </AppShell>
  );
}
