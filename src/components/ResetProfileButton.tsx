import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import { useMemo } from 'react';

import { useTheme } from '../hooks/useTheme';
import type { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../stores/useAppStore';

type ResetNavigation = NativeStackNavigationProp<RootStackParamList>;

interface ResetProfileButtonProps {
  onAfterReset?: () => void;
  onPress?: () => void;
}

export function ResetProfileButton({ onAfterReset, onPress }: ResetProfileButtonProps) {
  const navigation = useNavigation<ResetNavigation>();
  const resetProfile = useAppStore((state) => state.resetProfile);
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 14,
          paddingVertical: 12,
        },
        text: {
          color: colors.text,
          fontSize: 15,
          fontWeight: '600',
        },
      }),
    [colors]
  );

  const handlePress = () => {
    onPress?.();
    Alert.alert(
      'Actualizar datos',
      'Se borrarán el perfil y los entrenamientos completados para que puedas volver a configurarlos. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
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
    <Pressable
      style={styles.row}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Actualizar datos"
    >
      <Ionicons name="create-outline" size={20} color={colors.text} />
      <Text style={styles.text}>Actualizar datos</Text>
    </Pressable>
  );
}
