import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FiltersState {
  premiumChecked: boolean;
  autorefreshChecked: boolean;
  setPremiumChecked: (value: boolean) => void;
  setAutorefreshChecked: (value: boolean) => void;
}
export const useFiltersStore = create<FiltersState, [['zustand/persist', FiltersState]]>(
  persist(
    (set) => ({
      premiumChecked: false,
      autorefreshChecked: false,
      setPremiumChecked: (value: boolean) => set({ premiumChecked: value }),
      setAutorefreshChecked: (value: boolean) => set({ autorefreshChecked: value }),
    }),
    {
      name: 'filters-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
