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
import { DevResetProfileButton } from '../components/DevResetProfileButton';
import { useTheme } from '../hooks/useTheme';
import type { Gender, WorkoutLocation } from '../models/types';
import type { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../stores/useAppStore';
import { MIN_MATCHABLE_WEIGHT_KG } from '../utils/profileRanges';
import { calculateAge } from '../utils/routineMatcher';

type ProfileNavigation = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const DEFAULT_BIRTH_DATE = new Date(2000, 0, 1);

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

  const [gender, setGender] = useState<Gender | null>(null);
  const [workoutLocation, setWorkoutLocation] = useState<WorkoutLocation | null>(null);
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
        genderRow: {
          flexDirection: 'row',
          gap: 12,
          marginBottom: 24,
        },
        locationColumn: {
          gap: 12,
          marginBottom: 24,
        },
        genderButton: {
          flex: 1,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: 'center',
          backgroundColor: colors.inputBackground,
        },
        genderButtonActive: {
          borderColor: colors.primary,
          backgroundColor: colors.primaryActive,
        },
        genderText: {
          color: colors.textSecondary,
          fontWeight: '600',
        },
        genderTextActive: {
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

    const parsedWeight = Number(weight.replace(',', '.'));
    if (!weight.trim() || Number.isNaN(parsedWeight) || parsedWeight <= 0) {
      Alert.alert('Peso inválido', 'Introduce un peso válido en kilogramos.');
      return;
    }

    if (parsedWeight < MIN_MATCHABLE_WEIGHT_KG) {
      Alert.alert(
        'Peso fuera de rango',
        `Introduce un peso de ${MIN_MATCHABLE_WEIGHT_KG} kg o más.`
      );
      return;
    }

    const birthDateIso = formatBirthDate(birthDate);

    try {
      calculateAge(birthDateIso);
    } catch {
      Alert.alert('Fecha inválida', 'Selecciona una fecha de nacimiento válida.');
      return;
    }

    setIsSaving(true);

    const saved = await setProfile({
      gender,
      workoutLocation,
      weight: parsedWeight,
      birthDate: birthDateIso,
    });

    setIsSaving(false);

    if (!saved) {
      Alert.alert(
        'Sin rutina disponible',
        'Aún no hay una rutina en casa o gimnasio para esa combinación de edad y peso. Prueba otros valores.'
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
            Indica dónde entrenarás y tus datos personales. Stride elige la rutina según el entorno,
            rangos de edad y peso.
          </Text>

          <Text style={styles.label}>Género</Text>
          <View style={styles.genderRow}>
            <Pressable
              style={[styles.genderButton, gender === 'male' && styles.genderButtonActive]}
              onPress={() => setGender('male')}
            >
              <Text
                style={[styles.genderText, gender === 'male' && styles.genderTextActive]}
              >
                Hombre
              </Text>
            </Pressable>
            <Pressable
              style={[styles.genderButton, gender === 'female' && styles.genderButtonActive]}
              onPress={() => setGender('female')}
            >
              <Text
                style={[styles.genderText, gender === 'female' && styles.genderTextActive]}
              >
                Mujer
              </Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Tipo de rutina</Text>
          <View style={styles.locationColumn}>
            <Pressable
              style={[
                styles.genderButton,
                workoutLocation === 'home' && styles.genderButtonActive,
              ]}
              onPress={() => setWorkoutLocation('home')}
            >
              <Text
                style={[
                  styles.genderText,
                  workoutLocation === 'home' && styles.genderTextActive,
                ]}
              >
                Rutinas en Casa
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.genderButton,
                workoutLocation === 'gym' && styles.genderButtonActive,
              ]}
              onPress={() => setWorkoutLocation('gym')}
            >
              <Text
                style={[
                  styles.genderText,
                  workoutLocation === 'gym' && styles.genderTextActive,
                ]}
              >
                Rutinas en el Gimnasio
              </Text>
            </Pressable>
          </View>

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

          <DevResetProfileButton
            onAfterReset={() => {
              setGender(null);
              setWorkoutLocation(null);
              setWeight('');
              setBirthDate(DEFAULT_BIRTH_DATE);
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </AppShell>
  );
}
