import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Gender } from '../models/types';
import type { RootStackParamList } from '../navigation/types';
import { calculateAge } from '../utils/routineMatcher';
import { useAppStore } from '../stores/useAppStore';

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

  const [gender, setGender] = useState<Gender | null>(null);
  const [weight, setWeight] = useState('');
  const [birthDate, setBirthDate] = useState(DEFAULT_BIRTH_DATE);
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');
  const [isSaving, setIsSaving] = useState(false);

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const handleSave = async () => {
    if (!gender) {
      Alert.alert('Perfil incompleto', 'Selecciona tu género.');
      return;
    }

    const parsedWeight = Number(weight.replace(',', '.'));
    if (!weight.trim() || Number.isNaN(parsedWeight) || parsedWeight <= 0) {
      Alert.alert('Peso inválido', 'Introduce un peso válido en kilogramos.');
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
      weight: parsedWeight,
      birthDate: birthDateIso,
    });

    setIsSaving(false);

    if (!saved) {
      Alert.alert(
        'Sin rutina disponible',
        'No encontramos una rutina para tu perfil. Ajusta peso o fecha de nacimiento.'
      );
      return;
    }

    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={styles.title}>Tu perfil</Text>
        <Text style={styles.subtitle}>
          Necesitamos estos datos para recomendarte la rutina semanal ideal.
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

        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          placeholder="Ej. 70"
          placeholderTextColor="#64748b"
        />

        <Text style={styles.label}>Fecha de nacimiento</Text>
        {Platform.OS === 'android' && (
          <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateButtonText}>{formatBirthDate(birthDate)}</Text>
          </Pressable>
        )}
        {showDatePicker && (
          <DateTimePicker
            value={birthDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={handleDateChange}
          />
        )}

        <Pressable
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>{isSaving ? 'Guardando...' : 'Guardar'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    lineHeight: 22,
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 10,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  genderButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#1e293b',
  },
  genderButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#1d4ed8',
  },
  genderText: {
    color: '#cbd5e1',
    fontWeight: '600',
  },
  genderTextActive: {
    color: '#ffffff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#f8fafc',
    fontSize: 16,
    marginBottom: 24,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  dateButtonText: {
    color: '#f8fafc',
    fontSize: 16,
  },
  saveButton: {
    marginTop: 'auto',
    marginBottom: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
