import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';

import { useTheme } from '../hooks/useTheme';
import type { RootStackParamList } from '../navigation/types';

type WelcomeNavigation = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const APP_INTRO =
  'Entrena en casa o en el gimnasio con una rutina semanal clara, adaptada a ti.';

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeNavigation>();
  const { colors, images, statusBarStyle } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
          paddingHorizontal: 32,
        },
        logo: {
          width: 220,
          height: 220,
        },
        intro: {
          marginTop: 8,
          fontSize: 16,
          lineHeight: 24,
          color: colors.textSecondary,
          textAlign: 'center',
          maxWidth: 320,
        },
        button: {
          marginTop: 32,
          backgroundColor: colors.primary,
          borderRadius: 12,
          paddingVertical: 16,
          paddingHorizontal: 28,
          alignItems: 'center',
          minWidth: 240,
        },
        buttonText: {
          color: colors.primaryText,
          fontSize: 16,
          fontWeight: '700',
        },
      }),
    [colors]
  );

  return (
    <View style={styles.container}>
      <StatusBar style={statusBarStyle} />
      <Image
        source={images.splashLogo}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Logo de Stride"
      />
      <Text style={styles.intro}>{APP_INTRO}</Text>
      <Pressable
        style={styles.button}
        onPress={() => navigation.replace('Profile')}
        accessibilityRole="button"
        accessibilityLabel="Iniciar entrenamiento"
      >
        <Text style={styles.buttonText}>Iniciar entrenamiento</Text>
      </Pressable>
    </View>
  );
}
