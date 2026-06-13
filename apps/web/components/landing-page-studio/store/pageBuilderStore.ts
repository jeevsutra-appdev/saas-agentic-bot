import { create } from 'zustand';

export const DEFAULT_THEME_COLORS = {
  primary: '#4F46E5',
  secondary: '#7C3AED',
  accent: '#EC4899',
  text: '#1a202c',
  background: '#ffffff',
};

export type ThemeColors = typeof DEFAULT_THEME_COLORS;

interface PageBuilderState {
  isMobileMenuOpen: boolean;
  activeDevice: 'desktop' | 'tablet' | 'mobile';
  setMobileMenuOpen: (isOpen: boolean) => void;
  setActiveDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
  showPublishModal: boolean;
  setShowPublishModal: (show: boolean) => void;
  pageSlug: string;
  setPageSlug: (slug: string) => void;
  pageSettings: {
    productId?: string;
    seoTitle?: string;
    seoDescription?: string;
    primaryColor?: string;
    themeColors?: ThemeColors;
    [key: string]: any;
  };
  setPageSettings: (settings: any) => void;
  setThemeColor: (key: keyof ThemeColors, value: string) => void;
  getThemeColors: () => ThemeColors;
}

export const usePageBuilderStore = create<PageBuilderState>((set, get) => ({
  isMobileMenuOpen: false,
  activeDevice: 'desktop',
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  setActiveDevice: (device) => set({ activeDevice: device }),
  showPublishModal: false,
  setShowPublishModal: (show) => set({ showPublishModal: show }),
  pageSlug: '',
  setPageSlug: (slug) => set({ pageSlug: slug }),
  pageSettings: {
    themeColors: { ...DEFAULT_THEME_COLORS },
  },
  setPageSettings: (settings) => set((state) => ({
    pageSettings: { ...state.pageSettings, ...settings }
  })),
  setThemeColor: (key, value) => set((state) => ({
    pageSettings: {
      ...state.pageSettings,
      themeColors: {
        ...(state.pageSettings.themeColors ?? DEFAULT_THEME_COLORS),
        [key]: value,
      }
    }
  })),
  getThemeColors: () => {
    const s = get();
    return { ...DEFAULT_THEME_COLORS, ...(s.pageSettings.themeColors ?? {}) };
  },
}));
