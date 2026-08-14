import { create } from 'zustand';

interface NavStore {
  mobileOpen: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
}

export const useNavStore = create<NavStore>((set) => ({
  mobileOpen: false,
  toggleMobile: () => set((s) => ({ mobileOpen: !s.mobileOpen })),
  closeMobile: () => set({ mobileOpen: false }),
}));
