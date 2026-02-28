import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type TabValue = 'market' | 'avalon';

interface TabState {
  activeTab: TabValue;
  setActiveTab: (value: TabValue) => void;
}

export const useTabStore = create<TabState>()(
  persist(
    (set) => ({
      activeTab: 'market',
      setActiveTab: (value: TabValue) => set({ activeTab: value }),
    }),
    {
      name: 'tab-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
