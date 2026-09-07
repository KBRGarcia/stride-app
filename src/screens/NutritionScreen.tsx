import { Ionicons } from '@expo/vector-icons';
import { useMemo, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../components/AppShell';
import { MainSectionTabs } from '../components/MainSectionTabs';
import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../stores/useAppStore';
import {
  getNutritionGuide,
  NUTRITION_DISCLAIMER,
  NUTRITION_GOAL_TITLES,
} from '../utils/nutritionData';

interface SectionProps {
  title: string;
  children: ReactNode;
}

function Section({ title, children }: SectionProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
      }}
    >
      <Text
        style={{
          fontSize: 17,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 10,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

export default function NutritionScreen() {
  const profile = useAppStore((state) => state.profile);
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        header: {
          paddingHorizontal: 24,
          paddingTop: 12,
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
        content: {
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 32,
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
          marginTop: 8,
          marginBottom: 2,
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
        errorText: {
          fontSize: 15,
          color: colors.textMuted,
          textAlign: 'center',
          lineHeight: 22,
        },
        disclaimer: {
          backgroundColor: colors.dangerSurface,
          borderColor: colors.dangerBorder,
          borderWidth: 1,
          borderRadius: 16,
          padding: 16,
          marginTop: 4,
        },
        disclaimerHeader: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 8,
        },
        disclaimerText: {
          flex: 1,
          fontSize: 13,
          color: colors.dangerText,
          lineHeight: 20,
        },
      }),
    [colors]
  );

  if (!profile) {
    return (
      <AppShell>
        <MainSectionTabs active="nutrition" />
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>Sin perfil configurado</Text>
          <Text style={styles.errorText}>
            Completa la configuración inicial para ver las recomendaciones de nutrición.
          </Text>
        </View>
      </AppShell>
    );
  }

  const guide = getNutritionGuide(profile.goal);
  const menu = guide.ejemploMenuDiario;
  const timing = guide.timingDeComidas;

  const renderItems = (items: string[]) =>
    items.map((item) => (
      <Text key={item} style={styles.item}>
        {'\u2022'} {item}
      </Text>
    ));

  const renderField = (label: string, value?: string) =>
    value ? (
      <View key={label}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.body}>{value}</Text>
      </View>
    ) : null;

  return (
    <AppShell>
      <MainSectionTabs active="nutrition" />
      <View style={styles.header}>
        <Text style={styles.title}>Nutrición</Text>
        <Text style={styles.subtitle}>
          Guía para {NUTRITION_GOAL_TITLES[profile.goal].toLowerCase()}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Section title="Objetivo">
          <Text style={styles.body}>{guide.descripcion}</Text>
        </Section>

        <Section title="Calorías y macros">
          {renderField('Calorías', guide.caloriasYMacros.calorias)}
          {renderField('Proteínas', guide.caloriasYMacros.proteinas)}
          {renderField('Carbohidratos', guide.caloriasYMacros.carbohidratos)}
          {renderField('Grasas', guide.caloriasYMacros.grasas)}
        </Section>

        <Section title="Alimentos recomendados">
          {renderItems(guide.alimentosRecomendados)}
        </Section>

        <Section title="Alimentos a limitar o evitar">
          {renderItems(guide.alimentosAEliminarOLimitar)}
        </Section>

        <Section title="Hidratación">
          {renderField('Agua', guide.hidratacion.agua)}
          {renderField('Bebidas', guide.hidratacion.bebidas)}
        </Section>

        <Section title="Suplementos y estimulantes">
          {renderItems(guide.suplementosYEstimulantes.recomendados)}
          {renderField('Evitar', guide.suplementosYEstimulantes.evitar)}
        </Section>

        <Section title="Timing de comidas">
          {renderField('Antes del entreno', timing.antesEntreno)}
          {renderField('Durante el entreno', timing.duranteEntreno)}
          {renderField('Después del entreno', timing.despuesEntreno)}
          {renderField('Comida post-entreno', timing.comidaPostEntreno)}
          {renderField('Distribución', timing.distribucion)}
        </Section>

        <Section title="Ejemplo de menú diario">
          {renderField('Desayuno', menu.desayuno)}
          {renderField('Media mañana', menu.mediaManana)}
          {renderField('Comida', menu.comida)}
          {renderField('Merienda pre-entreno', menu.meriendaPreEntreno)}
          {renderField('Merienda', menu.merienda)}
          {renderField('Cena', menu.cena)}
          {renderField('Antes de dormir', menu.antesDormir)}
        </Section>

        <View style={styles.disclaimer}>
          <View style={styles.disclaimerHeader}>
            <Ionicons name="alert-circle" size={20} color={colors.dangerText} />
            <Text style={styles.disclaimerText}>{NUTRITION_DISCLAIMER}</Text>
          </View>
        </View>
      </ScrollView>
    </AppShell>
  );
}
