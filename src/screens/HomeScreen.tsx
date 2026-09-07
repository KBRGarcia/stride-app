import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../components/AppShell';
import { DevResetProfileButton } from '../components/DevResetProfileButton';
import { MainSectionTabs } from '../components/MainSectionTabs';
import { useTheme } from '../hooks/useTheme';
import type { DayOfWeek } from '../models/types';
import type { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../stores/useAppStore';
import { formatMuscleGroups } from '../utils/muscleGroups';
import { getDayExercises } from '../utils/routinesData';
import {
  getDayOfWeek,
  getDayScheduleStatus,
  getDayStatusLabel,
  isDayWorkoutAccessible,
} from '../utils/weekSchedule';

type HomeNavigation = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const DAY_LABELS: Record<DayOfWeek, { short: string; full: string }> = {
  1: { short: 'Lun', full: 'Lunes' },
  2: { short: 'Mar', full: 'Martes' },
  3: { short: 'Mié', full: 'Miércoles' },
  4: { short: 'Jue', full: 'Jueves' },
  5: { short: 'Vie', full: 'Viernes' },
  6: { short: 'Sáb', full: 'Sábado' },
  7: { short: 'Dom', full: 'Domingo' },
};

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const recommendation = useAppStore((state) => state.recommendation);
  const isDayCompleted = useAppStore((state) => state.isDayCompleted);
  const { colors } = useTheme();

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
        row: {
          gap: 12,
          marginBottom: 12,
        },
        dayCard: {
          flex: 1,
          minHeight: 148,
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
        },
        dayCardCompleted: {
          borderColor: colors.successBorder,
          backgroundColor: colors.successSurface,
        },
        dayCardToday: {
          borderColor: colors.primary,
          backgroundColor: colors.surface,
        },
        dayCardPreview: {
          backgroundColor: colors.surfaceSecondary,
        },
        dayCardHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        },
        dayShort: {
          fontSize: 22,
          fontWeight: '700',
          color: colors.text,
        },
        dayFull: {
          fontSize: 14,
          color: colors.textSecondary,
          marginBottom: 8,
        },
        exerciseCount: {
          fontSize: 13,
          color: colors.textMuted,
        },
        statusLabel: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.textMuted,
          marginTop: 4,
        },
        statusLabelToday: {
          color: colors.primary,
        },
        statusLabelCompleted: {
          color: colors.success,
        },
        muscleGroups: {
          fontSize: 12,
          color: colors.textSecondary,
          marginTop: 6,
          lineHeight: 16,
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

  if (!recommendation) {
    return (
      <AppShell>
        <MainSectionTabs active="home" />
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>No hay rutina disponible</Text>
          <Text style={styles.errorText}>
            No se encontró una rutina para tu perfil. Vuelve a configurarlo.
          </Text>
          <DevResetProfileButton />
        </View>
      </AppShell>
    );
  }

  const sortedDays = [...recommendation.weeklyRoutine].sort((a, b) => a.day - b.day);

  return (
    <AppShell>
      <MainSectionTabs active="home" />
      <View style={styles.header}>
        <Text style={styles.title}>Tu semana</Text>
        <Text style={styles.subtitle}>Plan de entrenamiento personalizado</Text>
      </View>

      <FlatList
        data={sortedDays}
        keyExtractor={(item) => String(item.day)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={<DevResetProfileButton />}
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
                : 'list-outline';

          const iconColor =
            status === 'completed'
              ? colors.success
              : status === 'today'
                ? colors.primary
                : colors.textMuted;

          return (
            <Pressable
              style={[
                styles.dayCard,
                status === 'completed' && styles.dayCardCompleted,
                status === 'today' && styles.dayCardToday,
                !canStart && !completed && styles.dayCardPreview,
              ]}
              onPress={() => navigation.navigate('Workout', { day: item.day })}
            >
              <View style={styles.dayCardHeader}>
                <Text style={styles.dayShort}>{labels.short}</Text>
                <Ionicons name={iconName} size={22} color={iconColor} />
              </View>
              <Text style={styles.dayFull}>{labels.full}</Text>
              <Text style={styles.exerciseCount}>
                {getDayExercises(item).length} ejercicios
              </Text>
              <Text style={styles.muscleGroups}>
                {formatMuscleGroups(getDayExercises(item))}
              </Text>
              <Text
                style={[
                  styles.statusLabel,
                  status === 'today' && styles.statusLabelToday,
                  status === 'completed' && styles.statusLabelCompleted,
                ]}
              >
                {getDayStatusLabel(status, { canRepeat: completed && isToday })}
              </Text>
            </Pressable>
          );
        }}
      />
    </AppShell>
  );
}
