import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { RootStackParamList } from './src/navigation/types';
import HomeScreen from './src/screens/HomeScreen';
import NutritionScreen from './src/screens/NutritionScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { BrandSplashScreen } from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import { useAppStore } from './src/stores/useAppStore';
import { useThemeStore } from './src/stores/useThemeStore';
import { getThemeColors } from './src/theme/colors';

const SPLASH_DURATION_MS = 2000;
const Stack = createNativeStackNavigator<RootStackParamList>();

if (Platform.OS !== 'web') {
  void ExpoSplashScreen.preventAutoHideAsync();
}

function AppNavigator() {
  const isHydrated = useAppStore((state) => state.isHydrated);
  const profile = useAppStore((state) => state.profile);
  const hydrate = useAppStore((state) => state.hydrate);
  const isThemeHydrated = useThemeStore((state) => state.isHydrated);
  const hydrateTheme = useThemeStore((state) => state.hydrate);
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const [hasShownSplash, setHasShownSplash] = useState(false);

  const navigationTheme = useMemo(() => {
    const colors = getThemeColors(colorScheme);
    const baseTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        primary: colors.primary,
      },
    };
  }, [colorScheme]);

  useEffect(() => {
    void Promise.all([hydrate(), hydrateTheme()]);
  }, [hydrate, hydrateTheme]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasShownSplash(true);
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    void ExpoSplashScreen.hideAsync();
  }, []);

  if (!hasShownSplash || !isHydrated || !isThemeHydrated) {
    return <BrandSplashScreen />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName={profile ? 'Home' : 'Welcome'}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Nutrition" component={NutritionScreen} />
        <Stack.Screen name="Workout" component={WorkoutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
