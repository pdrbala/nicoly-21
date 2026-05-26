import { create } from 'zustand';
import type { EraId } from '../data/eras';

interface EraState {
  selected: EraId | null;
  hovered: EraId | null;
  transitioning: boolean;
  introDone: boolean;
  select: (id: EraId) => void;
  hover: (id: EraId | null) => void;
  setTransitioning: (v: boolean) => void;
  finishIntro: () => void;
}

export const useEraStore = create<EraState>((set) => ({
  selected: null,
  hovered: null,
  transitioning: false,
  introDone: false,
  select: (id) => set({ selected: id }),
  hover: (id) => set({ hovered: id }),
  setTransitioning: (v) => set({ transitioning: v }),
  finishIntro: () => set({ introDone: true }),
}));
