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
  coverImage: string;
  skullMaterial: {
    color: string;
    emissive: string;
    metalness: number;
    roughness: number;
  };
}

// Palettes distilled directly from each album cover.
// Body background uses --paint (warm wash from bottom-left) + --bg (base).
// --accent drives glows, needles, pulses, text-shadows. --fg is the era's text color.
export const ERAS: Era[] = [
  {
    // Vessel — two older men, white room, soft blue striped shirts, dark slacks.
    // Mood: suburban dusk, piano + acoustic, melancholic clean.
    id: 'vessel',
    name: 'Vessel',
    year: '2013',
    track: 'A1',
    trackLabel: 'Semi-Automatic',
    audio: 'audio/vessel.mp3',
    bg: '#08101a',
    paint: '#1a2538',
    label: '#0c1422',
    line: 'rgba(220, 232, 244, 0.14)',
    glow: 'rgba(168, 197, 219, 0.5)',
    accent: '#a8c5db',
    fg: '#e4eef4',
    muted: 'rgba(228, 238, 244, 0.5)',
    freq: '21.1',
    sid: 'N-VSL',
    phrase: 'antes de saber, você já era.',
    cover: 'vessel',
    coverImage: 'covers/vessel.jpg',
    skullMaterial: { color: '#e8eef4', emissive: '#1a2538', metalness: 0.05, roughness: 0.55 },
  },
  {
    // Blurryface — 9 circles (mostly white, two iconic red) on pure black.
    // The brand: BLACK + RED, graphic, clean lines.
    id: 'blurry',
    name: 'Blurryface',
    year: '2015',
    track: 'A2',
    trackLabel: 'Heavydirtysoul',
    audio: 'audio/blurryface.mp3',
    bg: '#06020a',
    paint: '#3a0810',
    label: '#1a0408',
    line: 'rgba(255, 220, 220, 0.12)',
    glow: 'rgba(230, 57, 70, 0.6)',
    accent: '#e63946',
    fg: '#f5e0e4',
    muted: 'rgba(245, 224, 228, 0.5)',
    freq: '21.3',
    sid: 'N-BLR',
    phrase: 'a coragem de chamar suas sombras pelo nome.',
    cover: 'blurry',
    coverImage: 'covers/blurryface.jpg',
    // Black mask, blood-red glow under the skin — pure Blurryface vibe.
    skullMaterial: { color: '#0a0202', emissive: '#e63946', metalness: 0.35, roughness: 0.55 },
  },
  {
    // Trench — black vulture on canary yellow. Iconic split: yellow + black.
    // Mood: fugitive, dystopian, dust + bandit.
    id: 'trench',
    name: 'Trench',
    year: '2018',
    track: 'A3',
    trackLabel: 'The Hype',
    audio: 'audio/trench.mp3',
    bg: '#0a0703',
    paint: '#3a2d08',
    label: '#1a1408',
    line: 'rgba(245, 232, 200, 0.14)',
    glow: 'rgba(245, 197, 24, 0.55)',
    accent: '#f5c518',
    fg: '#f5e8c8',
    muted: 'rgba(245, 232, 200, 0.55)',
    freq: '21.5',
    sid: 'N-TRN',
    phrase: 'fugir foi o jeito de voltar pra dentro.',
    cover: 'trench',
    coverImage: 'covers/trench.jpg',
    // Yellow-painted skull, the Bandito mask vibe.
    skullMaterial: { color: '#f5c518', emissive: '#3a2d08', metalness: 0.15, roughness: 0.6 },
  },
  {
    // Scaled and Icy — the dragon "Trash" is teal/cyan; that IS the album identity
    // (pink is the cover backdrop, not the brand color). Album reads as "icy blue".
    id: 'sai',
    name: 'Scaled & Icy',
    year: '2021',
    track: 'A4',
    trackLabel: 'Choker',
    audio: 'audio/sai.mp3',
    bg: '#04101a',
    paint: '#0e3a52',
    label: '#08202e',
    line: 'rgba(190, 232, 245, 0.16)',
    glow: 'rgba(95, 184, 212, 0.6)',
    accent: '#5fb8d4',
    fg: '#dff2fa',
    muted: 'rgba(223, 242, 250, 0.55)',
    freq: '21.7',
    sid: 'N-SAI',
    phrase: 'luz baixa o bastante pra dormir, alta o bastante pra esperar.',
    cover: 'sai',
    coverImage: 'covers/sai.jpg',
    // Icy chrome — clean metallic teal with a hint of cyan glow.
    skullMaterial: { color: '#cfe9f2', emissive: '#0e3a52', metalness: 0.92, roughness: 0.12 },
  },
  {
    // Clancy — sky split: deep RED on the left, bright YELLOW on the right,
    // two figures in pure black, hooded/masked. Burnt-amber sits between them.
    id: 'clancy',
    name: 'Clancy',
    year: '2024',
    track: 'A5',
    trackLabel: 'Oldies Station',
    audio: 'audio/clancy.mp3',
    bg: '#0a0502',
    paint: '#3a1a08',
    label: '#1a0c04',
    line: 'rgba(245, 216, 184, 0.14)',
    glow: 'rgba(232, 119, 44, 0.55)',
    accent: '#e8772c',
    fg: '#f5d8b8',
    muted: 'rgba(245, 216, 184, 0.55)',
    freq: '21.8',
    sid: 'N-CLY',
    phrase: 'o fim de um capítulo cabia num abraço.',
    cover: 'clancy',
    coverImage: 'covers/clancy.jpg',
    // Copper / rust — sun-baked metal mask.
    skullMaterial: { color: '#a04018', emissive: '#e8772c', metalness: 0.7, roughness: 0.4 },
  },
  {
    // Breach — cinematic blood-spotlight on pure black. Heavy contrast,
    // deep saturated red against absolute black. Theatrical, ritual.
    id: 'breach',
    name: 'Breach',
    year: '2025',
    track: 'A6',
    trackLabel: 'Tally',
    audio: 'audio/breach.mp3',
    bg: '#050102',
    paint: '#6a0c14',
    label: '#2a0408',
    line: 'rgba(255, 200, 200, 0.16)',
    glow: 'rgba(200, 30, 38, 0.85)',
    accent: '#c91e26',
    fg: '#f5d8d8',
    muted: 'rgba(245, 216, 216, 0.55)',
    freq: '21.9',
    sid: 'N-BRC',
    phrase: 'a rachadura por onde o mundo grande entra.',
    cover: 'breach',
    coverImage: 'covers/breach.jpg',
    // Pitch-black mask under a hot crimson spotlight emission.
    skullMaterial: { color: '#080202', emissive: '#c91e26', metalness: 0.55, roughness: 0.45 },
  },
];

export const ERA_BY_ID: Record<EraId, Era> = ERAS.reduce(
  (acc, e) => ({ ...acc, [e.id]: e }),
  {} as Record<EraId, Era>
);
