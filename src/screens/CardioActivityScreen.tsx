import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../components/AppShell';
import { MainSectionTabs } from '../components/MainSectionTabs';
import { useTheme } from '../hooks/useTheme';
import type { RootStackParamList } from '../navigation/types';
import {
  formatCardioMainWorkout,
  getCardioActivity,
  getCardioWeekDays,
} from '../utils/cardioData';

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
          lineHeight: 22,
        },
        content: {
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 32,
        },
        card: {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 16,
          marginBottom: 14,
        },
        cardTitle: {
          fontSize: 17,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 10,
        },
        body: {
          fontSize: 15,
          color: colors.textSecondary,
          lineHeight: 22,
        },
        item: {
          fontSize: 15,
          color: colors.textSecondary,
          lineHeight: 22,
          marginBottom: 6,
        },
        fieldLabel: {
          fontSize: 13,
          fontWeight: '700',
          color: colors.text,
          marginTop: 10,
          marginBottom: 4,
        },
        note: {
          fontSize: 13,
          color: colors.textMuted,
          lineHeight: 20,
          fontStyle: 'italic',
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
        <Text style={styles.subtitle}>{activity.duracionEstimada}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Descripción</Text>
          <Text style={styles.body}>{activity.descripcion}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recomendaciones generales</Text>
          {activity.recomendacionesGenerales.map((item, index) => (
            <Text key={`recomendacion-${index}`} style={styles.item}>
              {'\u2022'} {item}
            </Text>
          ))}
        </View>

        {days.map((day) => (
          <View key={day.nombre} style={styles.card}>
            <Text style={styles.cardTitle}>{day.nombre}</Text>

            {day.actividad ? <Text style={styles.body}>{day.actividad}</Text> : null}

            {day.calentamiento ? (
              <>
                <Text style={styles.fieldLabel}>
                  Calentamiento ({day.calentamiento.duracion})
                </Text>
                {day.calentamiento.ejercicios.map((item, index) => (
                  <Text key={`calentamiento-${index}`} style={styles.item}>
                    {'\u2022'} {item}
                  </Text>
                ))}
              </>
            ) : null}

            {formatCardioMainWorkout(day.entrenamientoPrincipal).map((field, fieldIndex) => (
              <View key={`bloque-${fieldIndex}`}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                {field.values.map((value, valueIndex) => (
                  <Text key={`bloque-${fieldIndex}-${valueIndex}`} style={styles.item}>
                    {field.values.length > 1 ? `\u2022 ${value}` : value}
                  </Text>
                ))}
              </View>
            ))}

            <Text style={styles.fieldLabel}>
              Enfriamiento ({day.enfriamientoEstiramientos.duracion})
            </Text>
            {day.enfriamientoEstiramientos.ejercicios.map((stretch, index) => (
              <View key={`estiramiento-${index}`}>
                <Text style={styles.item}>
                  {'\u2022'} {stretch.nombre}: {stretch.descripcion}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.card}>
          <Text style={styles.note}>{activity.nota}</Text>
        </View>
      </ScrollView>
    </AppShell>
  );
}
