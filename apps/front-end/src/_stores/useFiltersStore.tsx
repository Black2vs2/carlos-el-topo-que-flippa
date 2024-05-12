import { create } from 'zustand';

interface FiltersState {
  premiumChecked: boolean;
  autorefreshChecked: boolean;
  setPremiumChecked: (value: boolean) => void;
  setAutorefreshChecked: (value: boolean) => void;
}
export const useFiltersStore = create<FiltersState>((set) => ({
  premiumChecked: false,
  autorefreshChecked: false,
  setPremiumChecked: (value: boolean) => set({ premiumChecked: value }),
  setAutorefreshChecked: (value: boolean) => set({ autorefreshChecked: value }),
}));
