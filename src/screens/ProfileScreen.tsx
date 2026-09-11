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
import { MIN_SUPPORTED_AGE, MIN_SUPPORTED_WEIGHT_KG } from '../utils/archetypes';
import { calculateAge } from '../utils/routineMatcher';

type ProfileNavigation = NativeStackNavigationProp<RootStackParamList, 'Profile'>;
type GenderSelection = 'male' | 'female';

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

  const [gender, setGender] = useState<GenderSelection | null>(null);
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
        optionsRow: {
          flexDirection: 'row',
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
        optionButtonFlex: {
          flex: 1,
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
      }),
    [colors]
  );

  const handleSave = async () => {
    if (!gender) {
      Alert.alert('Perfil incompleto', 'Selecciona tu género.');
      return;
    }

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

    const birthDateIso = formatBirthDate(birthDate);

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
        'No hay una rutina disponible para el entorno, objetivo, edad y peso seleccionados.'
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
            Indica dónde entrenarás, qué deseas conseguir y tus datos personales. Stride
            personalizará automáticamente tu rutina según tu edad y peso.
          </Text>

          <Text style={styles.label}>Género</Text>
          <View style={styles.optionsRow}>
            <Pressable
              style={[
                styles.optionButton,
                styles.optionButtonFlex,
                gender === 'male' && styles.optionButtonActive,
              ]}
              onPress={() => setGender('male')}
            >
              <Text
                style={[
                  styles.optionText,
                  gender === 'male' && styles.optionTextActive,
                ]}
              >
                Hombre
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.optionButton,
                styles.optionButtonFlex,
                gender === 'female' && styles.optionButtonActive,
              ]}
              onPress={() => setGender('female')}
            >
              <Text
                style={[
                  styles.optionText,
                  gender === 'female' && styles.optionTextActive,
                ]}
              >
                Mujer
              </Text>
            </Pressable>
          </View>

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
