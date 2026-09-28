import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppShell } from '../components/AppShell';
import { BirthDatePicker } from '../components/BirthDatePicker';
import { useTheme } from '../hooks/useTheme';
import type { WorkoutGoal, WorkoutLocation } from '../models/types';
import type { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../stores/useAppStore';
import {
  AGE_BAND_LABELS,
  DEFAULT_AGE_PRESCRIPTIONS,
  MIN_SUPPORTED_AGE,
  MIN_SUPPORTED_WEIGHT_KG,
  getAgeBand,
} from '../utils/ageBands';
import { calculateAge } from '../utils/routineMatcher';
import { getGoalCatalog } from '../utils/routinesData';

type ProfileNavigation = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const DEFAULT_BIRTH_DATE = new Date(2000, 0, 1);
const GOAL_OPTIONS: ReadonlyArray<{ value: WorkoutGoal; label: string }> = [
  { value: 'toning', label: 'Tonificación' },
  { value: 'muscle_gain', label: 'Aumento de masa muscular' },
  { value: 'fat_reduction', label: 'Reducción de grasa' },
];

function formatBirthDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileNavigation>();
  const setProfile = useAppStore((state) => state.setProfile);
  const { colors } = useTheme();

  const [workoutLocation, setWorkoutLocation] = useState<WorkoutLocation | null>(null);
  const [goal, setGoal] = useState<WorkoutGoal | null>(null);
  const [weight, setWeight] = useState('');
  const [birthDate, setBirthDate] = useState(DEFAULT_BIRTH_DATE);
  const [isSaving, setIsSaving] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        flex: { flex: 1 },
        content: {
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 24,
        },
        title: {
          fontSize: 28,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 8,
        },
        subtitle: {
          fontSize: 15,
          color: colors.textMuted,
          lineHeight: 22,
          marginBottom: 28,
        },
        label: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.textSecondary,
          marginBottom: 10,
        },
        optionsColumn: {
          gap: 12,
          marginBottom: 24,
        },
        optionButton: {
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: 'center',
          backgroundColor: colors.inputBackground,
        },
        optionButtonActive: {
          borderColor: colors.primary,
          backgroundColor: colors.primaryActive,
        },
        optionText: {
          color: colors.textSecondary,
          fontWeight: '600',
        },
        optionTextActive: {
          color: colors.primaryText,
        },
        input: {
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.inputBackground,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          color: colors.text,
          fontSize: 16,
          marginBottom: 24,
        },
        saveButton: {
          marginTop: 8,
          backgroundColor: colors.primary,
          borderRadius: 12,
          paddingVertical: 16,
          alignItems: 'center',
        },
        saveButtonDisabled: {
          opacity: 0.6,
        },
        saveButtonText: {
          color: colors.primaryText,
          fontSize: 16,
          fontWeight: '700',
        },
        ageSummary: {
          marginTop: -8,
          marginBottom: 24,
          fontSize: 15,
          lineHeight: 22,
          color: colors.textSecondary,
        },
        ageSummaryInvalid: {
          color: colors.dangerText,
        },
      }),
    [colors]
  );

  const birthDateIso = formatBirthDate(birthDate);
  const agePreview = useMemo(() => {
    try {
      const age = calculateAge(birthDateIso);
      return { age, band: getAgeBand(age) };
    } catch {
      return null;
    }
  }, [birthDateIso]);

  const agePrescription =
    agePreview?.band && workoutLocation && goal
      ? getGoalCatalog(workoutLocation, goal).distribucionEdades[agePreview.band]
      : agePreview?.band
        ? DEFAULT_AGE_PRESCRIPTIONS[agePreview.band]
        : null;

  const handleSave = async () => {
    if (!workoutLocation) {
      Alert.alert('Perfil incompleto', 'Selecciona el tipo de rutina que deseas.');
      return;
    }

    if (!goal) {
      Alert.alert('Perfil incompleto', 'Selecciona el objetivo de tu rutina.');
      return;
    }

    const parsedWeight = Number(weight.replace(',', '.'));
    if (!weight.trim() || Number.isNaN(parsedWeight) || parsedWeight <= 0) {
      Alert.alert('Peso inválido', 'Introduce un peso válido en kilogramos.');
      return;
    }

    if (parsedWeight < MIN_SUPPORTED_WEIGHT_KG) {
      Alert.alert(
        'Peso fuera de rango',
        `Introduce un peso de ${MIN_SUPPORTED_WEIGHT_KG} kg o más.`
      );
      return;
    }

    let age: number;
    try {
      age = calculateAge(birthDateIso);
    } catch {
      Alert.alert('Fecha inválida', 'Selecciona una fecha de nacimiento válida.');
      return;
    }

    if (age < MIN_SUPPORTED_AGE) {
      Alert.alert(
        'Edad fuera de rango',
        `Las rutinas están disponibles a partir de los ${MIN_SUPPORTED_AGE} años.`
      );
      return;
    }

    setIsSaving(true);

    const saved = await setProfile({
      workoutLocation,
      goal,
      weight: parsedWeight,
      birthDate: birthDateIso,
    });

    setIsSaving(false);

    if (!saved) {
      Alert.alert(
        'Sin rutina disponible',
        'No hay una rutina disponible para la edad seleccionada. Las rutinas empiezan a los 14 años.'
      );
      return;
    }

    navigation.replace('Home');
  };

  return (
    <AppShell>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Tu perfil</Text>
          <Text style={styles.subtitle}>
            Indica dónde entrenarás, qué deseas conseguir y tus datos personales. Los
            ejercicios son los mismos para todas las edades; cambian las series y las
            repeticiones.
          </Text>

          <Text style={styles.label}>Tipo de rutina</Text>
          <View style={styles.optionsColumn}>
            <Pressable
              style={[
                styles.optionButton,
                workoutLocation === 'home' && styles.optionButtonActive,
              ]}
              onPress={() => setWorkoutLocation('home')}
            >
              <Text
                style={[
                  styles.optionText,
                  workoutLocation === 'home' && styles.optionTextActive,
                ]}
              >
                Rutinas en Casa
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.optionButton,
                workoutLocation === 'gym' && styles.optionButtonActive,
              ]}
              onPress={() => setWorkoutLocation('gym')}
            >
              <Text
                style={[
                  styles.optionText,
                  workoutLocation === 'gym' && styles.optionTextActive,
                ]}
              >
                Rutinas en el Gimnasio
              </Text>
            </Pressable>
          </View>

          {workoutLocation ? (
            <>
              <Text style={styles.label}>Objetivo</Text>
              <View style={styles.optionsColumn}>
                {GOAL_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.optionButton,
                      goal === option.value && styles.optionButtonActive,
                    ]}
                    onPress={() => setGoal(option.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        goal === option.value && styles.optionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          <Text style={styles.label}>Peso (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholder="Ej. 71"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Fecha de nacimiento</Text>
          <BirthDatePicker value={birthDate} onChange={setBirthDate} maximumDate={new Date()} />
          {agePreview ? (
            <Text
              style={[
                styles.ageSummary,
                !agePreview.band && styles.ageSummaryInvalid,
              ]}
            >
              {agePreview.band && agePrescription
                ? `Tienes ${agePreview.age} años (${AGE_BAND_LABELS[agePreview.band]}). Tu rutina usa ${agePrescription.series} series de ${agePrescription.repeticiones} repeticiones.`
                : `Tienes ${agePreview.age} años. Las rutinas están disponibles a partir de los ${MIN_SUPPORTED_AGE} años.`}
            </Text>
          ) : (
            <Text style={[styles.ageSummary, styles.ageSummaryInvalid]}>
              Selecciona una fecha de nacimiento válida.
            </Text>
          )}

          <Pressable
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>{isSaving ? 'Guardando...' : 'Guardar'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppShell>
  );
}
