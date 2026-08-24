import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import { useMemo } from 'react';

import { useTheme } from '../hooks/useTheme';
import type { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../stores/useAppStore';

type DevNavigation = NativeStackNavigationProp<RootStackParamList>;

interface DevResetProfileButtonProps {
  onAfterReset?: () => void;
}

export function DevResetProfileButton({ onAfterReset }: DevResetProfileButtonProps) {
  const navigation = useNavigation<DevNavigation>();
  const resetProfile = useAppStore((state) => state.resetProfile);
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        button: {
          marginTop: 12,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.dangerBorder,
          borderRadius: 12,
          paddingVertical: 14,
          alignItems: 'center',
          backgroundColor: colors.dangerSurface,
        },
        text: {
          color: colors.dangerText,
          fontSize: 14,
          fontWeight: '600',
        },
      }),
    [colors]
  );

  if (!__DEV__) {
    return null;
  }

  const handlePress = () => {
    Alert.alert(
      'Restablecer perfil (dev)',
      'Se borrarán el perfil y los entrenamientos completados. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: async () => {
            await resetProfile();
            onAfterReset?.();
            navigation.reset({ index: 0, routes: [{ name: 'Profile' }] });
          },
        },
      ]
    );
  };

  return (
    <Pressable style={styles.button} onPress={handlePress}>
      <Text style={styles.text}>Restablecer perfil (dev)</Text>
    </Pressable>
  );
}
