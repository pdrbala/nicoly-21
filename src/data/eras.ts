export type EraId = 'vessel' | 'blurry' | 'trench' | 'sai' | 'clancy' | 'breach';

export interface Era {
  id: EraId;
  name: string;
  year: string;
  track: string;
  trackLabel: string;
  audio: string;
  bg: string;
  paint: string;
  label: string;
  line: string;
  glow: string;
  accent: string;
  fg: string;
  muted: string;
  freq: string;
  sid: string;
  phrase: string;
  cover: string;
  skullMaterial: {
    color: string;
    emissive: string;
    metalness: number;
    roughness: number;
  };
}

export const ERAS: Era[] = [
  {
    id: 'vessel',
    name: 'Vessel',
    year: '2013',
    track: 'A1',
    trackLabel: 'Semi-Automatic',
    audio: 'audio/vessel.mp3',
    bg: '#0a0512',
    paint: '#3a1f5c',
    label: '#1a0d2e',
    line: 'rgba(232,226,255,0.14)',
    glow: 'rgba(140,70,220,0.55)',
    accent: '#a37cff',
    fg: '#f0e6ff',
    muted: 'rgba(240,230,255,0.5)',
    freq: '21.1',
    sid: 'N-VSL',
    phrase: 'antes de saber, você já era.',
    cover: 'vessel',
    skullMaterial: { color: '#e8dfff', emissive: '#3a1f5c', metalness: 0.1, roughness: 0.5 },
  },
  {
    id: 'blurry',
    name: 'Blurryface',
    year: '2015',
    track: 'A2',
    trackLabel: 'Heavydirtysoul',
    audio: 'audio/blurryface.mp3',
    bg: '#0a0303',
    paint: '#8b0000',
    label: '#2a0606',
    line: 'rgba(255,255,255,0.1)',
    glow: 'rgba(220,30,30,0.6)',
    accent: '#ff5454',
    fg: '#fbe4e4',
    muted: 'rgba(251,228,228,0.5)',
    freq: '21.3',
    sid: 'N-BLR',
    phrase: 'a coragem de chamar suas sombras pelo nome.',
    cover: 'blurry',
    skullMaterial: { color: '#1a0000', emissive: '#8b0000', metalness: 0.2, roughness: 0.6 },
  },
  {
    id: 'trench',
    name: 'Trench',
    year: '2018',
    track: 'A3',
    trackLabel: 'The Hype',
    audio: 'audio/trench.mp3',
    bg: '#0d1208',
    paint: '#3a4a18',
    label: '#1a200a',
    line: 'rgba(255,255,255,0.12)',
    glow: 'rgba(245,192,0,0.55)',
    accent: '#f5c000',
    fg: '#f1ecd0',
    muted: 'rgba(241,236,208,0.55)',
    freq: '21.5',
    sid: 'N-TRN',
    phrase: 'fugir foi o jeito de voltar pra dentro.',
    cover: 'trench',
    skullMaterial: { color: '#f5ecd0', emissive: '#2a3010', metalness: 0.05, roughness: 0.7 },
  },
  {
    id: 'sai',
    name: 'Scaled & Icy',
    year: '2021',
    track: 'A4',
    trackLabel: 'Choker',
    audio: 'audio/sai.mp3',
    bg: '#06121f',
    paint: '#0e3a5c',
    label: '#0a1d2e',
    line: 'rgba(255,255,255,0.12)',
    glow: 'rgba(96,196,236,0.6)',
    accent: '#60c4ec',
    fg: '#e1f0ff',
    muted: 'rgba(225,240,255,0.55)',
    freq: '21.7',
    sid: 'N-SAI',
    phrase: 'luz baixa o bastante pra dormir, alta o bastante pra esperar.',
    cover: 'sai',
    skullMaterial: { color: '#cfe9f7', emissive: '#0e3a5c', metalness: 0.85, roughness: 0.15 },
  },
  {
    id: 'clancy',
    name: 'Clancy',
    year: '2024',
    track: 'A5',
    trackLabel: 'Oldies Station',
    audio: 'audio/clancy.mp3',
    bg: '#120904',
    paint: '#7a3a18',
    label: '#2e1608',
    line: 'rgba(255,255,255,0.12)',
    glow: 'rgba(232,150,80,0.55)',
    accent: '#e88a3c',
    fg: '#f5e9d6',
    muted: 'rgba(245,233,214,0.55)',
    freq: '21.8',
    sid: 'N-CLY',
    phrase: 'o fim de um capítulo cabia num abraço.',
    cover: 'clancy',
    skullMaterial: { color: '#3a1a08', emissive: '#e88a3c', metalness: 0.3, roughness: 0.5 },
  },
  {
    id: 'breach',
    name: 'Breach',
    year: '2025',
    track: 'A6',
    trackLabel: 'Tally',
    audio: 'audio/breach.mp3',
    bg: '#04081a',
    paint: '#1838a0',
    label: '#08122e',
    line: 'rgba(255,255,255,0.14)',
    glow: 'rgba(80,140,255,0.6)',
    accent: '#5a9cff',
    fg: '#dde8ff',
    muted: 'rgba(221,232,255,0.55)',
    freq: '21.9',
    sid: 'N-BRC',
    phrase: 'a rachadura por onde o mundo grande entra.',
    cover: 'breach',
    skullMaterial: { color: '#0a1428', emissive: '#5a9cff', metalness: 0.7, roughness: 0.25 },
  },
];

export const ERA_BY_ID: Record<EraId, Era> = ERAS.reduce(
  (acc, e) => ({ ...acc, [e.id]: e }),
  {} as Record<EraId, Era>
);
