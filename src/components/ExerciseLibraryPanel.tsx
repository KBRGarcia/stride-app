import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../hooks/useTheme';
import type { ExerciseLibraryGroup, LibraryExercise, WorkoutGoal, WorkoutLocation } from '../models/types';
import { getExerciseLibrary, toLibraryExerciseView } from '../utils/exerciseLibrary';
import { formatExerciseFocus } from '../utils/muscleGroups';
import { NUTRITION_GOAL_TITLES } from '../utils/nutritionData';
import { formatExercisePrescription } from '../utils/workoutFormat';

const SECTION_ORDER = ['Pecho', 'Espalda', 'Hombros', 'Brazos', 'Abdomen', 'Piernas'];

interface ExerciseLibraryPanelProps {
  location: WorkoutLocation;
  goal: WorkoutGoal;
}

function sectionsFor(exercises: LibraryExercise[]): Array<{ title: string | null; items: LibraryExercise[] }> {
  const titles = [
    ...SECTION_ORDER.filter((title) => exercises.some((exercise) => exercise.grupoMuscular === title)),
    ...new Set(
      exercises
        .map((exercise) => exercise.grupoMuscular)
        .filter((title): title is string => typeof title === 'string' && !SECTION_ORDER.includes(title))
    ),
  ];

  if (titles.length <= 1) {
    return [{ title: null, items: exercises }];
  }

  return titles.map((title) => ({
    title,
    items: exercises.filter((exercise) => exercise.grupoMuscular === title),
  }));
}

export function ExerciseLibraryPanel({ location, goal }: ExerciseLibraryPanelProps) {
  const { colors } = useTheme();
  const [selectedGroupId, setSelectedGroupId] = useState<ExerciseLibraryGroup['id'] | null>(
    null
  );
  const library = getExerciseLibrary(location, goal);
  const selectedGroup =
    library.gruposMusculares.find((group) => group.id === selectedGroupId) ?? null;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        flex: { flex: 1 },
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
          lineHeight: 22,
        },
        listContent: {
          paddingHorizontal: 16,
          paddingBottom: 24,
        },
        row: {
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
        rowInfo: { flex: 1 },
        rowTitle: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
        },
        rowMeta: {
          marginTop: 2,
          fontSize: 13,
          color: colors.textMuted,
        },
        backButton: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          marginBottom: 8,
        },
        backLabel: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.primary,
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
        exerciseTitle: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 4,
        },
        exerciseMeta: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.primary,
        },
        exerciseDetail: {
          marginTop: 4,
          fontSize: 13,
          color: colors.textMuted,
        },
        exerciseDescription: {
          marginTop: 8,
          fontSize: 14,
          lineHeight: 20,
          color: colors.textSecondary,
        },
      }),
    [colors]
  );

  if (!selectedGroup) {
    return (
      <View style={styles.flex}>
        <View style={styles.header}>
          <Text style={styles.title}>Ejercicios</Text>
          <Text style={styles.subtitle}>
            {NUTRITION_GOAL_TITLES[goal]} · {location === 'gym' ? 'Gimnasio' : 'Casa'}. Elige un
            apartado.
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.listContent}>
          {library.gruposMusculares.map((group) => (
            <Pressable
              key={group.id}
              style={styles.row}
              onPress={() => setSelectedGroupId(group.id)}
            >
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>{group.nombre}</Text>
                <Text style={styles.rowMeta}>{group.ejercicios.length} ejercicios</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => setSelectedGroupId(null)}>
          <Ionicons name="chevron-back" size={18} color={colors.primary} />
          <Text style={styles.backLabel}>Ejercicios</Text>
        </Pressable>
        <Text style={styles.title}>{selectedGroup.nombre}</Text>
        <Text style={styles.subtitle}>{selectedGroup.ejercicios.length} ejercicios</Text>
      </View>
      <ScrollView contentContainerStyle={styles.listContent}>
        {sectionsFor(selectedGroup.ejercicios).map((section) => (
          <View key={section.title ?? 'ejercicios'}>
            {section.title ? <Text style={styles.phaseTitle}>{section.title}</Text> : null}
            {section.items.map((exercise) => {
              const view = toLibraryExerciseView(exercise);
              const prescription =
                view.sets || view.reps ? formatExercisePrescription(view) : null;

              return (
                <View key={exercise.id} style={styles.exerciseCard}>
                  <Text style={styles.exerciseTitle}>{view.name}</Text>
                  {prescription ? <Text style={styles.exerciseMeta}>{prescription}</Text> : null}
                  <Text style={styles.exerciseDetail}>{formatExerciseFocus(view)}</Text>
                  <Text style={styles.exerciseDescription}>{view.description}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
