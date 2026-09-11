import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../components/AppShell';
import { MainSectionTabs } from '../components/MainSectionTabs';
import { useTheme } from '../hooks/useTheme';
import type { RootStackParamList } from '../navigation/types';
import {
  countCardioDayItems,
  getCardioActivity,
  getCardioDayPresentation,
  getCardioWeekDays,
} from '../utils/cardioData';
import {
  getDayOfWeek,
  getDayScheduleStatus,
  getDayStatusLabel,
} from '../utils/weekSchedule';

type CardioActivityRoute = RouteProp<RootStackParamList, 'CardioActivity'>;
type CardioActivityNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'CardioActivity'
>;

export default function CardioActivityScreen() {
  const navigation = useNavigation<CardioActivityNavigation>();
  const route = useRoute<CardioActivityRoute>();
  const { colors } = useTheme();
  const activity = getCardioActivity(route.params.activityId);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        header: {
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 8,
        },
        backButton: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          marginBottom: 12,
          alignSelf: 'flex-start',
        },
        backLabel: {
          fontSize: 15,
          fontWeight: '600',
          color: colors.primary,
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
      }),
    [colors]
  );

  if (!activity) {
    return (
      <AppShell>
        <MainSectionTabs active="cardio" />
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>Actividad no encontrada</Text>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.navigate('Cardio')}
            accessibilityRole="button"
            accessibilityLabel="Volver a Cardio"
          >
            <Ionicons name="chevron-back" size={20} color={colors.primary} />
            <Text style={styles.backLabel}>Volver a Cardio</Text>
          </Pressable>
        </View>
      </AppShell>
    );
  }

  const days = getCardioWeekDays(activity);
  const today = getDayOfWeek();

  return (
    <AppShell>
      <MainSectionTabs active="cardio" />
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.navigate('Cardio')}
          accessibilityRole="button"
          accessibilityLabel="Volver a Cardio"
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
          <Text style={styles.backLabel}>Cardio</Text>
        </Pressable>
        <Text style={styles.title}>{activity.title}</Text>
        <Text style={styles.subtitle}>Elige un día para entrenar</Text>
      </View>

      <FlatList
        data={days}
        keyExtractor={(item, index) => `${item.nombre}-${index}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const presentation = getCardioDayPresentation(item);
          const isToday = presentation.dayOfWeek === today;
          const status = presentation.dayOfWeek
            ? getDayScheduleStatus(presentation.dayOfWeek, false)
            : 'upcoming';

          return (
            <Pressable
              style={[
                styles.dayRow,
                isToday && styles.dayRowToday,
                !isToday && styles.dayRowPreview,
              ]}
              onPress={() =>
                navigation.navigate('CardioSession', {
                  activityId: activity.id,
                  dayIndex: index,
                })
              }
              accessibilityRole="button"
              accessibilityLabel={presentation.weekdayFull}
            >
              <Text style={styles.dayShort}>{presentation.weekdayShort}</Text>
              <View style={styles.dayInfo}>
                <Text style={styles.dayFull}>{presentation.weekdayFull}</Text>
                <Text style={styles.dayMeta}>
                  {countCardioDayItems(item)} ejercicios
                </Text>
              </View>
              <Text style={[styles.statusLabel, isToday && styles.statusLabelToday]}>
                {getDayStatusLabel(status)}
              </Text>
              <Ionicons
                name={isToday ? 'fitness' : 'chevron-forward'}
                size={20}
                color={isToday ? colors.primary : colors.textMuted}
              />
            </Pressable>
          );
        }}
      />
    </AppShell>
  );
}
