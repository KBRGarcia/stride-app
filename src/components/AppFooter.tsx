import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../hooks/useTheme';

export function AppFooter() {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.footerBackground,
          borderTopColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.text, { color: colors.textMuted }]}>Developed by KBRGarcia</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderTopWidth: 1,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
