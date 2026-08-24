import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { DayOfWeek } from '../models/types';
import type { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../stores/useAppStore';

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

  if (!recommendation) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>No hay rutina disponible</Text>
          <Text style={styles.errorText}>
            No se encontró una rutina para tu perfil. Vuelve a configurarlo.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const sortedDays = [...recommendation.weeklyRoutine].sort((a, b) => a.day - b.day);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
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
        renderItem={({ item }) => {
          const completed = isDayCompleted(item.day);
          const labels = DAY_LABELS[item.day];

          return (
            <Pressable
              style={[styles.dayCard, completed && styles.dayCardCompleted]}
              onPress={() => navigation.navigate('Workout', { day: item.day })}
            >
              <View style={styles.dayCardHeader}>
                <Text style={styles.dayShort}>{labels.short}</Text>
                <Ionicons
                  name={completed ? 'checkmark-circle' : 'lock-closed'}
                  size={22}
                  color={completed ? '#22c55e' : '#64748b'}
                />
              </View>
              <Text style={styles.dayFull}>{labels.full}</Text>
              <Text style={styles.exerciseCount}>
                {item.exercises.length} ejercicios
              </Text>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: '#94a3b8',
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
    minHeight: 120,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  dayCardCompleted: {
    borderColor: '#166534',
    backgroundColor: '#14532d33',
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
    color: '#f8fafc',
  },
  dayFull: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 8,
  },
  exerciseCount: {
    fontSize: 13,
    color: '#94a3b8',
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
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
  },
});
