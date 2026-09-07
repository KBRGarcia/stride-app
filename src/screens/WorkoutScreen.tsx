import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useKeepAwake } from 'expo-keep-awake';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppShell } from '../components/AppShell';
import { useTheme } from '../hooks/useTheme';
import { useTimer } from '../hooks/useTimer';
import type { DayOfWeek, DayRoutine, Exercise } from '../models/types';
import type { RootStackParamList } from '../navigation/types';
import { markDayCompleted, useAppStore } from '../stores/useAppStore';
import { getExerciseImage } from '../utils/imageMapper';
import { formatMuscleGroups, getExerciseMuscleGroup } from '../utils/muscleGroups';
import { getDayExercises } from '../utils/routinesData';
import { formatElapsedDuration, formatExercisePrescription } from '../utils/workoutFormat';
import { isDayWorkoutAccessible, toIsoDate } from '../utils/weekSchedule';

type WorkoutRoute = RouteProp<RootStackParamList, 'Workout'>;
type WorkoutNavigation = NativeStackNavigationProp<RootStackParamList, 'Workout'>;

type WorkoutPhase = 'preview' | 'exercise' | 'rest' | 'countdown' | 'summary';
type ExerciseOutcome = 'completed' | 'skipped';

const DAY_LABELS: Record<DayOfWeek, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
};

function getTodayIso(): string {
  return toIsoDate(new Date());
}

export default function WorkoutScreen() {
  useKeepAwake();

  const navigation = useNavigation<WorkoutNavigation>();
  const route = useRoute<WorkoutRoute>();
  const recommendation = useAppStore((state) => state.recommendation);
  const isDayCompleted = useAppStore((state) => state.isDayCompleted);
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        main: { flex: 1 },
        content: {
          paddingHorizontal: 24,
          paddingBottom: 32,
        },
        headerRow: {
          marginTop: 8,
          marginBottom: 16,
        },
        progress: {
          color: colors.textMuted,
          fontSize: 14,
          fontWeight: '600',
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
          marginBottom: 8,
          lineHeight: 22,
        },
        previewHint: {
          fontSize: 14,
          color: colors.textMuted,
          marginBottom: 20,
          lineHeight: 20,
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
          fontWeight: '600',
          color: colors.primary,
        },
        exerciseCardGroup: {
          marginTop: 4,
          fontSize: 13,
          color: colors.textMuted,
        },
        phaseTitle: {
          marginTop: 8,
          marginBottom: 10,
          fontSize: 13,
          fontWeight: '700',
          color: colors.textMuted,
          textTransform: 'uppercase',
        },
        exerciseImage: {
          width: '100%',
          height: 220,
          borderRadius: 16,
          marginBottom: 20,
          backgroundColor: colors.imagePlaceholder,
        },
        exerciseName: {
          fontSize: 28,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 8,
        },
        prescription: {
          fontSize: 18,
          fontWeight: '600',
          color: colors.primary,
          marginBottom: 8,
        },
        muscleGroup: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.textSecondary,
          marginBottom: 12,
        },
        description: {
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
          marginBottom: 28,
        },
        primaryButton: {
          backgroundColor: colors.primary,
          borderRadius: 12,
          paddingVertical: 16,
          alignItems: 'center',
        },
        primaryButtonText: {
          color: colors.primaryText,
          fontSize: 16,
          fontWeight: '700',
        },
        skipButton: {
          marginTop: 12,
          backgroundColor: colors.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          paddingVertical: 16,
          alignItems: 'center',
        },
        skipButtonText: {
          color: colors.textSecondary,
          fontSize: 16,
          fontWeight: '700',
        },
        secondaryButton: {
          marginTop: 12,
          backgroundColor: colors.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          paddingVertical: 16,
          alignItems: 'center',
        },
        secondaryButtonText: {
          color: colors.textSecondary,
          fontSize: 16,
          fontWeight: '700',
        },
        restLabel: {
          marginTop: 48,
          textAlign: 'center',
          fontSize: 16,
          color: colors.textMuted,
          fontWeight: '600',
        },
        timerDisplay: {
          marginTop: 12,
          textAlign: 'center',
          fontSize: 96,
          fontWeight: '700',
          color: colors.text,
        },
        restHint: {
          marginTop: 12,
          textAlign: 'center',
          fontSize: 16,
          color: colors.textSecondary,
          marginBottom: 36,
        },
        controlsGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 12,
        },
        controlButton: {
          width: '47%',
          backgroundColor: colors.surface,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          paddingVertical: 18,
          alignItems: 'center',
          gap: 6,
        },
        controlText: {
          color: colors.text,
          fontWeight: '600',
          fontSize: 14,
        },
        stopButton: {
          borderColor: colors.dangerBorder,
          backgroundColor: `${colors.dangerSurface}88`,
        },
        stopText: {
          color: colors.dangerText,
        },
        countdownOverlay: {
          ...StyleSheet.absoluteFill,
          backgroundColor: `${colors.background}f2`,
          zIndex: 10,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        },
        countdownNumber: {
          fontSize: 120,
          fontWeight: '800',
          color: colors.primary,
        },
        countdownLabel: {
          marginTop: 8,
          fontSize: 18,
          color: colors.textMuted,
        },
        countdownExercise: {
          marginTop: 8,
          fontSize: 24,
          fontWeight: '700',
          color: colors.text,
          textAlign: 'center',
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
        summaryCard: {
          backgroundColor: colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 20,
          marginTop: 8,
          marginBottom: 24,
        },
        summaryCount: {
          fontSize: 22,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 8,
        },
        summaryTime: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.primary,
          marginBottom: 20,
        },
        summarySectionTitle: {
          fontSize: 14,
          fontWeight: '700',
          color: colors.textMuted,
          marginBottom: 8,
          textTransform: 'uppercase',
        },
        summaryItem: {
          fontSize: 15,
          color: colors.textSecondary,
          lineHeight: 22,
          marginBottom: 4,
        },
        summaryEmpty: {
          fontSize: 15,
          color: colors.textMuted,
          marginBottom: 16,
        },
        sectionSpacer: {
          marginTop: 16,
        },
      }),
    [colors]
  );

  const dayRoutine = useMemo(
    () => recommendation?.weeklyRoutine.find((day) => day.day === route.params.day),
    [recommendation, route.params.day]
  );

  const workoutDay = route.params.day;
  const completedThisWeek = isDayCompleted(workoutDay);
  const canStartWorkout = isDayWorkoutAccessible(workoutDay, completedThisWeek);
  const exercises = useMemo(
    () => (dayRoutine ? getDayExercises(dayRoutine) : []),
    [dayRoutine]
  );

  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [phase, setPhase] = useState<WorkoutPhase>('preview');
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [countdownExerciseName, setCountdownExerciseName] = useState('');
  const [outcomes, setOutcomes] = useState<ExerciseOutcome[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const outcomesRef = useRef<ExerciseOutcome[]>([]);

  const currentExercise = exercises[exerciseIndex];
  const nextExercise = exercises[exerciseIndex + 1];

  const recordOutcome = useCallback((outcome: ExerciseOutcome) => {
    const next = [...outcomesRef.current, outcome];
    outcomesRef.current = next;
    setOutcomes(next);
  }, []);

  const finishSession = useCallback(async () => {
    const startedAt = startedAtRef.current ?? Date.now();
    setElapsedMs(Date.now() - startedAt);
    await markDayCompleted(route.params.day, getTodayIso());
    setPhase('summary');
  }, [route.params.day]);

  const beginCountdownToNext = useCallback(
    (nextIndex: number) => {
      const upcoming = exercises[nextIndex];
      if (!upcoming) {
        void finishSession();
        return;
      }

      setCountdownExerciseName(upcoming.name);
      setCountdownValue(3);
      setPhase('countdown');
    },
    [exercises, finishSession]
  );

  const handleRestComplete = useCallback(() => {
    const nextIndex = exerciseIndex + 1;

    if (nextIndex >= exercises.length) {
      void finishSession();
      return;
    }

    beginCountdownToNext(nextIndex);
  }, [beginCountdownToNext, exerciseIndex, exercises.length, finishSession]);

  const getNextExerciseName = useCallback(() => {
    return nextExercise?.name ?? 'Siguiente ejercicio';
  }, [nextExercise?.name]);

  const { secondsLeft, isResting, isPaused, startRest, addTime, pause, resume, skipRest, stop } =
    useTimer({
      onRestComplete: handleRestComplete,
      getNextExerciseName,
    });

  useEffect(() => {
    if (phase !== 'countdown' || countdownValue === null) {
      return;
    }

    if (countdownValue === 0) {
      setExerciseIndex((index) => index + 1);
      setPhase('exercise');
      setCountdownValue(null);
      return;
    }

    const timeout = setTimeout(() => {
      setCountdownValue((value) => (value !== null ? value - 1 : null));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [countdownValue, phase]);

  useEffect(() => {
    if (isResting) {
      setPhase('rest');
    }
  }, [isResting]);

  const advanceAfterExercise = async (isLastExercise: boolean) => {
    if (isLastExercise) {
      await finishSession();
      return;
    }

    await startRest();
  };

  const handleFinishExercise = async () => {
    if (!currentExercise) {
      return;
    }

    recordOutcome('completed');
    await advanceAfterExercise(exerciseIndex >= exercises.length - 1);
  };

  const handleSkipExercise = async () => {
    if (!currentExercise) {
      return;
    }

    recordOutcome('skipped');
    await advanceAfterExercise(exerciseIndex >= exercises.length - 1);
  };

  const handleStartWorkout = () => {
    startedAtRef.current = Date.now();
    outcomesRef.current = [];
    setExerciseIndex(0);
    setOutcomes([]);
    setElapsedMs(0);
    setPhase('exercise');
  };

  const handleStop = async () => {
    Alert.alert('Detener entrenamiento', '¿Quieres salir sin finalizar la rutina?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Detener',
        style: 'destructive',
        onPress: async () => {
          await stop();
          navigation.navigate('Home');
        },
      },
    ]);
  };

  const goHome = () => {
    navigation.navigate('Home');
  };

  if (!dayRoutine) {
    return (
      <AppShell>
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>Rutina no encontrada</Text>
          <Pressable style={styles.primaryButton} onPress={goHome}>
            <Text style={styles.primaryButtonText}>Volver al inicio</Text>
          </Pressable>
        </View>
      </AppShell>
    );
  }

  const completedExercises = exercises.filter((_, index) => outcomes[index] === 'completed');
  const skippedExercises = exercises.filter((_, index) => outcomes[index] === 'skipped');

  return (
    <AppShell>
      <View style={styles.main}>
        {phase === 'countdown' && countdownValue !== null && (
          <View style={styles.countdownOverlay}>
            <Text style={styles.countdownNumber}>{countdownValue}</Text>
            <Text style={styles.countdownLabel}>Siguiente ejercicio</Text>
            <Text style={styles.countdownExercise}>{countdownExerciseName}</Text>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.content}>
          {phase === 'preview' && (
            <DayPreview
              canStart={canStartWorkout}
              completedThisWeek={completedThisWeek}
              dayLabel={DAY_LABELS[workoutDay]}
              dayRoutine={dayRoutine}
              onBack={goHome}
              onStart={handleStartWorkout}
              styles={styles}
            />
          )}

          {phase === 'exercise' && currentExercise && (
            <>
              <View style={styles.headerRow}>
                <Text style={styles.progress}>
                  Ejercicio {exerciseIndex + 1} / {exercises.length}
                </Text>
              </View>
              <Image
                source={getExerciseImage(currentExercise.imagePlaceholder)}
                style={styles.exerciseImage}
                resizeMode="cover"
              />
              <Text style={styles.exerciseName}>{currentExercise.name}</Text>
              <Text style={styles.prescription}>
                {formatExercisePrescription(currentExercise)}
              </Text>
              <Text style={styles.muscleGroup}>
                Grupo muscular: {getExerciseMuscleGroup(currentExercise)}
              </Text>
              <Text style={styles.description}>{currentExercise.description}</Text>

              <Pressable style={styles.primaryButton} onPress={() => void handleFinishExercise()}>
                <Text style={styles.primaryButtonText}>
                  {exerciseIndex >= exercises.length - 1
                    ? 'Finalizar entrenamiento'
                    : 'Terminar ejercicio'}
                </Text>
              </Pressable>
              <Pressable style={styles.skipButton} onPress={() => void handleSkipExercise()}>
                <Text style={styles.skipButtonText}>Saltar Ejercicio</Text>
              </Pressable>
            </>
          )}

          {phase === 'rest' && (
            <>
              <Text style={styles.restLabel}>Descanso</Text>
              <Text style={styles.timerDisplay}>{secondsLeft}</Text>
              <Text style={styles.restHint}>
                Siguiente: {nextExercise?.name ?? 'Fin de la rutina'}
              </Text>

              <View style={styles.controlsGrid}>
                <Pressable style={styles.controlButton} onPress={() => void addTime()}>
                  <Ionicons name="add-circle-outline" size={22} color={colors.text} />
                  <Text style={styles.controlText}>+15s</Text>
                </Pressable>

                <Pressable
                  style={styles.controlButton}
                  onPress={() => void (isPaused ? resume() : pause())}
                >
                  <Ionicons
                    name={isPaused ? 'play-circle-outline' : 'pause-circle-outline'}
                    size={22}
                    color={colors.text}
                  />
                  <Text style={styles.controlText}>{isPaused ? 'Reanudar' : 'Pausa'}</Text>
                </Pressable>

                <Pressable style={styles.controlButton} onPress={() => void skipRest()}>
                  <Ionicons name="play-skip-forward-outline" size={22} color={colors.text} />
                  <Text style={styles.controlText}>Continuar</Text>
                </Pressable>

                <Pressable style={[styles.controlButton, styles.stopButton]} onPress={handleStop}>
                  <Ionicons name="stop-circle-outline" size={22} color={colors.dangerText} />
                  <Text style={[styles.controlText, styles.stopText]}>Detener</Text>
                </Pressable>
              </View>
            </>
          )}

          {phase === 'summary' && (
            <>
              <Text style={styles.previewTitle}>Rutina finalizada</Text>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryCount}>
                  Ejercicios completados {completedExercises.length}/{exercises.length}
                </Text>
                <Text style={styles.summaryTime}>
                  Tiempo total: {formatElapsedDuration(elapsedMs)}
                </Text>

                <Text style={styles.summarySectionTitle}>Ejercicios completados</Text>
                {completedExercises.length > 0 ? (
                  completedExercises.map((exercise) => (
                    <Text key={exercise.id} style={styles.summaryItem}>
                      • {exercise.name}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.summaryEmpty}>Ninguno</Text>
                )}

                <Text style={[styles.summarySectionTitle, styles.sectionSpacer]}>
                  Ejercicios saltados
                </Text>
                {skippedExercises.length > 0 ? (
                  skippedExercises.map((exercise) => (
                    <Text key={exercise.id} style={styles.summaryItem}>
                      • {exercise.name}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.summaryEmpty}>Ninguno</Text>
                )}
              </View>

              <Pressable style={styles.primaryButton} onPress={goHome}>
                <Text style={styles.primaryButtonText}>Inicio</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </View>
    </AppShell>
  );
}

function DayPreview({
  canStart,
  completedThisWeek,
  dayLabel,
  dayRoutine,
  onBack,
  onStart,
  styles,
}: {
  canStart: boolean;
  completedThisWeek: boolean;
  dayLabel: string;
  dayRoutine: DayRoutine;
  onBack: () => void;
  onStart: () => void;
  styles: {
    previewTitle: object;
    previewSubtitle: object;
    previewHint: object;
    phaseTitle: object;
    exerciseCard: object;
    exerciseCardTitle: object;
    exerciseCardMeta: object;
    exerciseCardGroup: object;
    primaryButton: object;
    primaryButtonText: object;
    secondaryButton: object;
    secondaryButtonText: object;
  };
}) {
  const exercises = getDayExercises(dayRoutine);
  const phases: Array<{ title: string; items: Exercise[] }> = [
    { title: 'Calentamiento', items: dayRoutine.warmUp },
    { title: 'Entrenamiento', items: dayRoutine.mainWorkout },
    { title: 'Enfriamiento', items: dayRoutine.coolDown },
  ];

  return (
    <>
      <Text style={styles.previewTitle}>{dayLabel}</Text>
      <Text style={styles.previewSubtitle}>{formatMuscleGroups(exercises)}</Text>
      <Text style={styles.previewHint}>
        {canStart
          ? completedThisWeek
            ? 'Ya completaste este día. Puedes repetir la rutina las veces que quieras.'
            : 'Este es tu entrenamiento de hoy. Revisa los ejercicios y comienza cuando estés listo.'
          : 'Puedes consultar los ejercicios de este día. El entrenamiento solo se inicia el día que corresponde.'}
      </Text>

      {phases.map((phase) =>
        phase.items.length === 0 ? null : (
          <View key={phase.title}>
            <Text style={styles.phaseTitle}>{phase.title}</Text>
            {phase.items.map((exercise) => (
              <View key={exercise.id} style={styles.exerciseCard}>
                <Text style={styles.exerciseCardTitle}>{exercise.name}</Text>
                <Text style={styles.exerciseCardMeta}>
                  {formatExercisePrescription(exercise)}
                </Text>
                <Text style={styles.exerciseCardGroup}>
                  Grupo muscular: {getExerciseMuscleGroup(exercise)}
                </Text>
              </View>
            ))}
          </View>
        )
      )}

      {canStart && (
        <Pressable style={styles.primaryButton} onPress={onStart}>
          <Text style={styles.primaryButtonText}>
            {completedThisWeek ? 'Repetir entrenamiento' : 'Comenzar entrenamiento'}
          </Text>
        </Pressable>
      )}

      <Pressable style={styles.secondaryButton} onPress={onBack}>
        <Text style={styles.secondaryButtonText}>Inicio</Text>
      </Pressable>
    </>
  );
}
