import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../components/AppShell';
import { useTheme } from '../hooks/useTheme';
import type { RootStackParamList } from '../navigation/types';
import {
  getCardioActivity,
  getCardioDayPhases,
  getCardioDayPresentation,
  getCardioSessionDay,
} from '../utils/cardioData';

type CardioSessionRoute = RouteProp<RootStackParamList, 'CardioSession'>;
type CardioSessionNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'CardioSession'
>;

export default function CardioSessionScreen() {
  const navigation = useNavigation<CardioSessionNavigation>();
  const route = useRoute<CardioSessionRoute>();
  const { colors } = useTheme();
  const activity = getCardioActivity(route.params.activityId);
  const day = activity ? getCardioSessionDay(activity, route.params.dayIndex) : null;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        content: {
          paddingHorizontal: 24,
          paddingBottom: 32,
        },
        previewTitle: {
          fontSize: 26,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 6,
        },
        previewSubtitle: {
          fontSize: 15,
          color: colors.textSecondary,
          marginBottom: 20,
          lineHeight: 22,
        },
        phaseTitle: {
          marginTop: 8,
          marginBottom: 10,
          fontSize: 13,
          fontWeight: '700',
          color: colors.textMuted,
          textTransform: 'uppercase',
        },
        exerciseCard: {
          backgroundColor: colors.surface,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 14,
          marginBottom: 10,
        },
        exerciseCardTitle: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 4,
        },
        exerciseCardMeta: {
          fontSize: 14,
          color: colors.textSecondary,
          lineHeight: 20,
        },
        secondaryButton: {
          marginTop: 8,
          borderRadius: 12,
          paddingVertical: 16,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
        },
        secondaryButtonText: {
          color: colors.text,
          fontSize: 16,
          fontWeight: '700',
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
          marginBottom: 16,
        },
        backButton: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        backLabel: {
          fontSize: 15,
          fontWeight: '600',
          color: colors.primary,
        },
      }),
    [colors]
  );

  const goBackToActivity = () => {
    if (activity) {
      navigation.navigate('CardioActivity', { activityId: activity.id });
      return;
    }

    navigation.navigate('Cardio');
  };

  if (!activity || !day) {
    return (
      <AppShell>
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>Rutina no encontrada</Text>
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

  const presentation = getCardioDayPresentation(day);
  const phases = getCardioDayPhases(day);

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.previewTitle}>{presentation.weekdayFull}</Text>
        <Text style={styles.previewSubtitle}>{presentation.focus}</Text>

        {phases.map((phase) => (
          <View key={phase.title}>
            <Text style={styles.phaseTitle}>
              {phase.duration ? `${phase.title} · ${phase.duration}` : phase.title}
            </Text>
            {phase.items.map((item, index) => (
              <View key={`${phase.title}-${index}`} style={styles.exerciseCard}>
                <Text style={styles.exerciseCardTitle}>{item.title}</Text>
                {item.detail ? (
                  <Text style={styles.exerciseCardMeta}>{item.detail}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ))}

        <Pressable style={styles.secondaryButton} onPress={goBackToActivity}>
          <Text style={styles.secondaryButtonText}>Volver a la semana</Text>
        </Pressable>
      </ScrollView>
    </AppShell>
  );
}
