import { create } from 'zustand';

interface PlaybackState {
  playing: boolean;
  time: number;
  duration: number;
  level: number;
  crackle: boolean;
  setPlaying: (v: boolean) => void;
  setTime: (t: number) => void;
  setDuration: (d: number) => void;
  setLevel: (l: number) => void;
  toggleCrackle: () => void;
}

export const usePlaybackStore = create<PlaybackState>((set) => ({
  playing: false,
  time: 0,
  duration: 0,
  level: 0,
  crackle: true,
  setPlaying: (v) => set({ playing: v }),
  setTime: (t) => set({ time: t }),
  setDuration: (d) => set({ duration: d }),
  setLevel: (l) => set({ level: l }),
  toggleCrackle: () => set((s) => ({ crackle: !s.crackle })),
}));
