import { create } from "zustand";

interface FiltersState {
  premiumChecked: boolean;
  setPremiumChecked: (value: boolean) => void;
}
export const useFiltersStore = create<FiltersState>((set) => ({
  premiumChecked: false,
  setPremiumChecked: (value: boolean) => set({ premiumChecked: value }),
}));
