import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../components/AppShell';
import { MainSectionTabs } from '../components/MainSectionTabs';
import { NutritionPanel } from '../components/NutritionPanel';
import { SectionSubmenu } from '../components/SectionSubmenu';
import { useTheme } from '../hooks/useTheme';
import type { DayOfWeek } from '../models/types';
import type { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../stores/useAppStore';
import { getDayExercises } from '../utils/routinesData';
import { getNutritionGuide, NUTRITION_GOAL_TITLES } from '../utils/nutritionData';
import {
  getDayOfWeek,
  getDayScheduleStatus,
  getDayStatusLabel,
  isDayWorkoutAccessible,
} from '../utils/weekSchedule';

type HomeNavigation = NativeStackNavigationProp<RootStackParamList, 'Home'>;
type HomeSubmenu = 'plan' | 'nutrition';

const DAY_LABELS: Record<DayOfWeek, { short: string; full: string }> = {
  1: { short: 'Lun', full: 'Lunes' },
  2: { short: 'Mar', full: 'Martes' },
  3: { short: 'Mié', full: 'Miércoles' },
  4: { short: 'Jue', full: 'Jueves' },
  5: { short: 'Vie', full: 'Viernes' },
  6: { short: 'Sáb', full: 'Sábado' },
  7: { short: 'Dom', full: 'Domingo' },
};

const HOME_SUBMENU: ReadonlyArray<{ id: HomeSubmenu; label: string }> = [
  { id: 'plan', label: 'Plan' },
  { id: 'nutrition', label: 'Nutrición' },
];

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const recommendation = useAppStore((state) => state.recommendation);
  const profile = useAppStore((state) => state.profile);
  const isDayCompleted = useAppStore((state) => state.isDayCompleted);
  const { colors } = useTheme();
  const [submenu, setSubmenu] = useState<HomeSubmenu>('plan');

  const styles = useMemo(
    () =>
      StyleSheet.create({
        header: {
          paddingHorizontal: 24,
          paddingTop: 16,
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
        },
        listContent: {
          paddingHorizontal: 16,
          paddingBottom: 24,
        },
        dayRow: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: 14,
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 10,
        },
        dayRowCompleted: {
          borderColor: colors.successBorder,
          backgroundColor: colors.successSurface,
        },
        dayRowToday: {
          borderColor: colors.primary,
        },
        dayRowPreview: {
          backgroundColor: colors.surfaceSecondary,
        },
        dayShort: {
          width: 44,
          fontSize: 16,
          fontWeight: '700',
          color: colors.text,
        },
        dayInfo: {
          flex: 1,
        },
        dayFull: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
        },
        dayMeta: {
          marginTop: 2,
          fontSize: 13,
          color: colors.textMuted,
        },
        statusLabel: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.textMuted,
          marginRight: 8,
        },
        statusLabelToday: {
          color: colors.primary,
        },
        statusLabelCompleted: {
          color: colors.success,
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

  const nutritionGuide = profile ? getNutritionGuide(profile.goal) : null;

  return (
    <AppShell>
      <MainSectionTabs active="home" />
      <SectionSubmenu options={HOME_SUBMENU} active={submenu} onChange={setSubmenu} />

      {submenu === 'nutrition' ? (
        <NutritionPanel
          guide={nutritionGuide}
          title="Nutrición"
          subtitle={
            profile
              ? `Guía para ${NUTRITION_GOAL_TITLES[profile.goal].toLowerCase()}`
              : 'Según tu plan de entrenamiento'
          }
        />
      ) : !recommendation ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>No hay rutina disponible</Text>
          <Text style={styles.errorText}>
            No se encontró una rutina para tu perfil. Vuelve a configurarlo.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Tu semana</Text>
            <Text style={styles.subtitle}>Elige un día para entrenar</Text>
          </View>

          <FlatList
            data={[...recommendation.weeklyRoutine].sort((a, b) => a.day - b.day)}
            keyExtractor={(item) => String(item.day)}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const completed = isDayCompleted(item.day);
              const status = getDayScheduleStatus(item.day, completed);
              const canStart = isDayWorkoutAccessible(item.day, completed);
              const isToday = item.day === getDayOfWeek();
              const labels = DAY_LABELS[item.day];

              const iconName =
                status === 'completed'
                  ? 'checkmark-circle'
                  : status === 'today'
                    ? 'fitness'
                    : 'chevron-forward';

              const iconColor =
                status === 'completed'
                  ? colors.success
                  : status === 'today'
                    ? colors.primary
                    : colors.textMuted;

              return (
                <Pressable
                  style={[
                    styles.dayRow,
                    status === 'completed' && styles.dayRowCompleted,
                    status === 'today' && styles.dayRowToday,
                    !canStart && !completed && styles.dayRowPreview,
                  ]}
                  onPress={() => navigation.navigate('Workout', { day: item.day })}
                >
                  <Text style={styles.dayShort}>{labels.short}</Text>
                  <View style={styles.dayInfo}>
                    <Text style={styles.dayFull}>{labels.full}</Text>
                    <Text style={styles.dayMeta}>{getDayExercises(item).length} ejercicios</Text>
                  </View>
                  <Text
                    style={[
                      styles.statusLabel,
                      status === 'today' && styles.statusLabelToday,
                      status === 'completed' && styles.statusLabelCompleted,
                    ]}
                  >
                    {getDayStatusLabel(status, { canRepeat: completed && isToday })}
                  </Text>
                  <Ionicons name={iconName} size={20} color={iconColor} />
                </Pressable>
              );
            }}
          />
        </>
      )}
    </AppShell>
  );
}
