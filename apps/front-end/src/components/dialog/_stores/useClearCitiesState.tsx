import { ProfitableOrders } from "../../../@types/AOData";
import { create } from "zustand";

interface ClearCitiesState {
  open: boolean;
  selectedCityId: number;
  loading: boolean;
  setOpen: (value: boolean) => void;
  setSelectedCityId: (value: number) => void;
  setLoading: (value: boolean) => void;
}
export const useClearCitiesState = create<ClearCitiesState>((set) => ({
  open: false,
  selectedCityId: -1,
  loading: false,
  setOpen: (value: boolean) => set({ open: value }),
  setSelectedCityId: (value: number) => set({ selectedCityId: value }),
  setLoading: (value: boolean) => set({ loading: value }),
}));
