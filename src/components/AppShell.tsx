import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useTheme } from '../hooks/useTheme';
import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { colors, statusBarStyle } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style={statusBarStyle} />
      <AppHeader />
      <View style={styles.content}>{children}</View>
      <SafeAreaView
        edges={['bottom']}
        style={[styles.footerSafe, { backgroundColor: colors.footerBackground }]}
      >
        <AppFooter />
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  footerSafe: {},
});
