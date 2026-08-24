import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTimer } from '../hooks/useTimer';
import type { Exercise } from '../models/types';
import type { RootStackParamList } from '../navigation/types';
import { markDayCompleted, useAppStore } from '../stores/useAppStore';
import { getExerciseImage } from '../utils/imageMapper';

type WorkoutRoute = RouteProp<RootStackParamList, 'Workout'>;
type WorkoutNavigation = NativeStackNavigationProp<RootStackParamList, 'Workout'>;

type WorkoutPhase = 'exercise' | 'rest' | 'countdown';

function getTodayIso(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatExercisePrescription(exercise: Exercise): string {
  if (exercise.durationSeconds) {
    return `${exercise.sets} series × ${exercise.durationSeconds}s`;
  }

  return `${exercise.sets} series × ${exercise.reps ?? '-'}`;
}

export default function WorkoutScreen() {
  useKeepAwake();

  const navigation = useNavigation<WorkoutNavigation>();
  const route = useRoute<WorkoutRoute>();
  const recommendation = useAppStore((state) => state.recommendation);

  const dayRoutine = useMemo(
    () => recommendation?.weeklyRoutine.find((day) => day.day === route.params.day),
    [recommendation, route.params.day]
  );

  const exercises = dayRoutine?.exercises ?? [];

  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [phase, setPhase] = useState<WorkoutPhase>('exercise');
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [countdownExerciseName, setCountdownExerciseName] = useState('');

  const currentExercise = exercises[exerciseIndex];
  const nextExercise = exercises[exerciseIndex + 1];

  const completeWorkout = useCallback(async () => {
    await markDayCompleted(route.params.day, getTodayIso());
    navigation.navigate('Home');
  }, [navigation, route.params.day]);

  const beginCountdownToNext = useCallback(
    (nextIndex: number) => {
      const upcoming = exercises[nextIndex];
      if (!upcoming) {
        void completeWorkout();
        return;
      }

      setCountdownExerciseName(upcoming.name);
      setCountdownValue(3);
      setPhase('countdown');
    },
    [completeWorkout, exercises]
  );

  const handleRestComplete = useCallback(() => {
    const nextIndex = exerciseIndex + 1;

    if (nextIndex >= exercises.length) {
      void completeWorkout();
      return;
    }

    beginCountdownToNext(nextIndex);
  }, [beginCountdownToNext, completeWorkout, exerciseIndex, exercises.length]);

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

  const handleFinishExercise = async () => {
    if (!currentExercise) {
      return;
    }

    if (exerciseIndex >= exercises.length - 1) {
      await completeWorkout();
      return;
    }

    await startRest();
  };

  const handleStop = async () => {
    Alert.alert('Detener entrenamiento', '¿Quieres salir y guardar el progreso hasta ahora?', [
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

  if (!dayRoutine || !currentExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>Rutina no encontrada</Text>
          <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.primaryButtonText}>Volver al inicio</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {phase === 'countdown' && countdownValue !== null && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdownNumber}>{countdownValue}</Text>
          <Text style={styles.countdownLabel}>Siguiente ejercicio</Text>
          <Text style={styles.countdownExercise}>{countdownExerciseName}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.progress}>
            Ejercicio {exerciseIndex + 1} / {exercises.length}
          </Text>
        </View>

        {phase === 'exercise' && (
          <>
            <Image
              source={getExerciseImage(currentExercise.imagePlaceholder)}
              style={styles.exerciseImage}
              resizeMode="cover"
            />
            <Text style={styles.exerciseName}>{currentExercise.name}</Text>
            <Text style={styles.prescription}>
              {formatExercisePrescription(currentExercise)}
            </Text>
            <Text style={styles.description}>{currentExercise.description}</Text>

            <Pressable style={styles.primaryButton} onPress={() => void handleFinishExercise()}>
              <Text style={styles.primaryButtonText}>
                {exerciseIndex >= exercises.length - 1
                  ? 'Finalizar entrenamiento'
                  : 'Terminar ejercicio'}
              </Text>
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
                <Ionicons name="add-circle-outline" size={22} color="#f8fafc" />
                <Text style={styles.controlText}>+15s</Text>
              </Pressable>

              <Pressable
                style={styles.controlButton}
                onPress={() => void (isPaused ? resume() : pause())}
              >
                <Ionicons
                  name={isPaused ? 'play-circle-outline' : 'pause-circle-outline'}
                  size={22}
                  color="#f8fafc"
                />
                <Text style={styles.controlText}>{isPaused ? 'Reanudar' : 'Pausa'}</Text>
              </Pressable>

              <Pressable style={styles.controlButton} onPress={() => void skipRest()}>
                <Ionicons name="play-skip-forward-outline" size={22} color="#f8fafc" />
                <Text style={styles.controlText}>Continuar</Text>
              </Pressable>

              <Pressable style={[styles.controlButton, styles.stopButton]} onPress={handleStop}>
                <Ionicons name="stop-circle-outline" size={22} color="#fecaca" />
                <Text style={[styles.controlText, styles.stopText]}>Detener</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerRow: {
    marginTop: 8,
    marginBottom: 16,
  },
  progress: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: '#1e293b',
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  prescription: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#cbd5e1',
    marginBottom: 28,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  restLabel: {
    marginTop: 48,
    textAlign: 'center',
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
  },
  timerDisplay: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 96,
    fontWeight: '700',
    color: '#f8fafc',
  },
  restHint: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 36,
  },
  controlsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  controlButton: {
    width: '47%',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 18,
    alignItems: 'center',
    gap: 6,
  },
  controlText: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 14,
  },
  stopButton: {
    borderColor: '#7f1d1d',
    backgroundColor: '#450a0a88',
  },
  stopText: {
    color: '#fecaca',
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0f172af2',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  countdownNumber: {
    fontSize: 120,
    fontWeight: '800',
    color: '#3b82f6',
  },
  countdownLabel: {
    marginTop: 8,
    fontSize: 18,
    color: '#94a3b8',
  },
  countdownExercise: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
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
    color: '#f8fafc',
    marginBottom: 16,
  },
});
