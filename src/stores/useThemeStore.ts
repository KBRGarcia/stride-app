import { create } from 'zustand';

import type { ColorScheme } from '../theme/types';
import { getColorScheme, saveColorScheme } from '../utils/storage';

interface ThemeState {
  colorScheme: ColorScheme;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setColorScheme: (colorScheme: ColorScheme) => Promise<void>;
  toggleColorScheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  colorScheme: 'dark',
  isHydrated: false,

  hydrate: async () => {
    const stored = await getColorScheme();
    set({
      colorScheme: stored ?? 'dark',
      isHydrated: true,
    });
  },

  setColorScheme: async (colorScheme) => {
    await saveColorScheme(colorScheme);
    set({ colorScheme });
  },

  toggleColorScheme: async () => {
    const next: ColorScheme = get().colorScheme === 'dark' ? 'light' : 'dark';
    await saveColorScheme(next);
    set({ colorScheme: next });
  },
}));
