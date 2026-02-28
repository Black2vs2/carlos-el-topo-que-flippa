import { create } from 'zustand';

interface State {
  checkedIds: number[];
  addCheckedId: (value: number) => void;
  removeCheckedId: (value: number) => void;
}
export const useDataStore = create<State>((set) => ({
  checkedIds: [],
  addCheckedId: (value: number) => set((state) => ({ checkedIds: [...state.checkedIds, value] })),
  removeCheckedId: (value: number) => set((state) => ({ checkedIds: state.checkedIds.filter((id) => id !== value) })),
}));
