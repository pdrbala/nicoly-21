import type { EraId } from './eras';

export interface LyricCue {
  time: number;
  end: number;
  text: string;
}

export interface LyricSource {
  path: string;
  provider: string;
  offset: number;
}

export const LYRICS_SOURCES: Partial<Record<EraId, LyricSource>> = {
  vessel: {
    path: '/lyrics/vessel.lrc',
    provider: 'LRCLIB',
    offset: 0,
  },
  blurry: {
    path: '/lyrics/blurry.lrc',
    provider: 'LRCLIB',
    offset: 0,
  },
  trench: {
    path: '/lyrics/trench.lrc',
    provider: 'LRCLIB',
    offset: 0,
  },
  sai: {
    path: '/lyrics/sai.lrc',
    provider: 'LRCLIB',
    offset: 0,
  },
  clancy: {
    path: '/lyrics/clancy.lrc',
    provider: 'LRCLIB',
    offset: 0,
  },
  breach: {
    path: '/lyrics/breach.lrc',
    provider: 'LRCLIB',
    offset: 0,
  },
};

function parseTimestamp(raw: string) {
  const [minutes = '0', seconds = '0'] = raw.split(':');
  return Number(minutes) * 60 + Number(seconds);
}

function estimateCueEnd(time: number, text: string, nextTime: number | null) {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const estimatedDuration = Math.max(0.95, Math.min(4.1, 0.72 + wordCount * 0.27));
  const naturalEnd = time + estimatedDuration;
  if (nextTime === null) return naturalEnd;
  return Math.max(time + 0.55, Math.min(naturalEnd, nextTime - 0.12));
}

export function parseLrcText(sheet: string, offset = 0) {
  const cues = sheet
    .trim()
    .split(/\r?\n/)
    .flatMap((line) => {
      const matches = [...line.matchAll(/\[(\d{1,3}:\d{2}(?:\.\d{1,3})?)(?:-(\d{1,3}:\d{2}(?:\.\d{1,3})?))?\]/g)];
      const text = line.replace(/\[[^\]]+\]/g, '').trim();
      if (!matches.length || !text) return [];

      return matches.map((match) => {
        const time = Math.max(0, parseTimestamp(match[1]) + offset);
        return {
          time,
          end: match[2] ? Math.max(time + 0.25, parseTimestamp(match[2]) + offset) : 0,
          text,
        };
      });
    })
    .sort((a, b) => a.time - b.time);

  return cues.map((cue, index) => ({
    ...cue,
    end: cue.end || estimateCueEnd(cue.time, cue.text, cues[index + 1]?.time ?? null),
  }));
}

export const ERA_LYRICS: Record<EraId, LyricCue[]> = {
  vessel: [],
  blurry: [],
  trench: [],
  sai: [],
  clancy: [],
  breach: [],
};
