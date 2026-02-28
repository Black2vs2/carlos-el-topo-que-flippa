import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FiltersState {
  premiumChecked: boolean;
  setPremiumChecked: (value: boolean) => void;
}
export const useFiltersStore = create<FiltersState>()(
  persist(
    (set) => ({
      premiumChecked: false,
      setPremiumChecked: (value: boolean) => set({ premiumChecked: value }),
    }),
    {
      name: 'filters-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
