import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useEraStore } from '../store/useEraStore';
import { usePlaybackStore } from '../store/usePlaybackStore';
import { ERA_LYRICS, LYRICS_SOURCES, parseLrcText, type LyricCue } from '../data/lyrics';
import { seekTo, setVolume } from '../audio/playerControls';

const LYRIC_DISPLAY_LEAD_SECONDS = 0.04;
const LYRIC_INSTRUMENTAL_GAP_SECONDS = 2.8;
const LYRIC_INSTRUMENTAL_RELEASE_SECONDS = 0.9;

function formatClock(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '0:00';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function getActiveIndex(time: number, cues: { time: number; end: number }[]) {
  let activeIndex = -1;
  const cueEpsilon = 0.03;
  for (let i = 0; i < cues.length; i++) {
    const startReached = time + LYRIC_DISPLAY_LEAD_SECONDS + cueEpsilon >= cues[i].time;
    if (startReached) activeIndex = i;
    else break;
  }

  if (activeIndex < 0) return -1;

  const cue = cues[activeIndex];
  const nextCue = cues[activeIndex + 1];
  if (!nextCue) {
    return time <= cue.end + LYRIC_INSTRUMENTAL_RELEASE_SECONDS ? activeIndex : -1;
  }

  const gapUntilNext = nextCue.time - cue.end;
  const isLongBreak = gapUntilNext > LYRIC_INSTRUMENTAL_GAP_SECONDS;
  if (isLongBreak && time > cue.end + LYRIC_INSTRUMENTAL_RELEASE_SECONDS) return -1;

  return activeIndex;
}

export function LyricsPanel() {
  const selected = useEraStore((s) => s.selected);
  const playing = usePlaybackStore((s) => s.playing);
  const time = usePlaybackStore((s) => s.time);
  const duration = usePlaybackStore((s) => s.duration);
  const volume = usePlaybackStore((s) => s.volume);
  const [loadedCues, setLoadedCues] = useState<LyricCue[]>([]);
  const [lyricsState, setLyricsState] = useState<'idle' | 'loading' | 'ready' | 'missing'>('idle');
  const lineRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const cues = selected ? loadedCues : [];
  const hasLyrics = cues.length > 0;
  const activeIndex = useMemo(() => getActiveIndex(time, cues), [time, cues]);

  useEffect(() => {
    let cancelled = false;
    lineRefs.current = [];

    if (!selected) {
      setLoadedCues([]);
      setLyricsState('idle');
      return;
    }

    const fallback = ERA_LYRICS[selected];
    const source = LYRICS_SOURCES[selected];
    if (!source) {
      setLoadedCues(fallback);
      setLyricsState(fallback.length ? 'ready' : 'missing');
      return;
    }

    setLyricsState('loading');
    fetch(source.path, { cache: 'no-cache' })
      .then((response) => {
        if (!response.ok) throw new Error(`Lyrics not found: ${response.status}`);
        return response.text();
      })
      .then((text) => parseLrcText(text, source.offset))
      .then((nextCues) => {
        if (cancelled) return;
        const finalCues = nextCues.length ? nextCues : fallback;
        setLoadedCues(finalCues);
        setLyricsState(finalCues.length ? 'ready' : 'missing');
      })
      .catch(() => {
        if (cancelled) return;
        setLoadedCues(fallback);
        setLyricsState(fallback.length ? 'ready' : 'missing');
      });

    return () => {
      cancelled = true;
    };
  }, [selected]);

  useEffect(() => {
    const activeLine = lineRefs.current[activeIndex];
    const windowEl = activeLine?.parentElement;
    if (!activeLine || !windowEl) return;

    const anchor = windowEl.clientHeight * 0.56 - activeLine.offsetHeight / 2;
    windowEl.scrollTo({
      top: Math.max(0, activeLine.offsetTop - anchor),
      behavior: playing ? 'smooth' : 'auto',
    });
  }, [activeIndex, playing, selected]);

  const onScrub = (event: ChangeEvent<HTMLInputElement>) => {
    seekTo(Number(event.currentTarget.value));
  };

  const onVolume = (event: ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(event.currentTarget.value));
  };

  const emptyLines = selected
    ? lyricsState === 'loading'
      ? ['loading synced lyrics', 'checking LRC timestamps', '']
      : ['synced lyrics not available', 'no placeholder lyrics', 'fetch the track LRC first']
    : ['choose a track', 'timed lyrics will appear here', 'Vessel is ready'];

  return (
    <section
      className={`lyrics-stage ${playing ? 'is-playing' : 'is-paused'} ${hasLyrics ? '' : 'is-empty'}`}
      aria-label="letra sincronizada"
    >
      <div className="lyrics-window">
        {hasLyrics
          ? cues.map((cue, index) => {
              const referenceIndex = activeIndex >= 0 ? activeIndex : 0;
              const distance = Math.abs(index - referenceIndex);
              const state =
                index === activeIndex ? 'is-active' : time > cue.end ? 'is-past' : 'is-next';

              return (
                <button
                  key={`${selected}-${cue.time}`}
                  ref={(node) => {
                    lineRefs.current[index] = node;
                  }}
                  className={`lyric-line ${state} distance-${Math.min(distance, 3)}`}
                  type="button"
                  onClick={() => seekTo(cue.time)}
                >
                  {cue.text}
                </button>
              );
            })
          : emptyLines.map((line, index) => (
              <p key={line} className={`lyric-line ${index === 0 ? 'is-active' : ''}`}>
                {line}
              </p>
            ))}
      </div>

      <div className="lyrics-footer">
        <div className="lyrics-progress">
          <span>{formatClock(time)}</span>
          <input
            aria-label="posicao da musica"
            className="lyrics-scrub"
            type="range"
            min={0}
            max={Math.max(duration, 1)}
            step={0.1}
            value={Math.min(time, Math.max(duration, 1))}
            onChange={onScrub}
            onInput={onScrub}
          />
          <span>{formatClock(duration)}</span>
        </div>
        <label className="volume-control">
          <span className="volume-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20">
              <path d="M3 8.1v3.8h3.1l4.2 3.2V4.9L6.1 8.1H3Z" />
              <path d="M12.6 7.1c.8.7 1.2 1.7 1.2 2.9s-.4 2.2-1.2 2.9" />
              <path d="M14.7 5.1c1.4 1.2 2.1 2.9 2.1 4.9s-.7 3.7-2.1 4.9" />
            </svg>
          </span>
          <input
            aria-label="volume"
            className="volume-scrub"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={onVolume}
            onInput={onVolume}
          />
          <span className="volume-value">{Math.round(volume * 100)}</span>
        </label>
      </div>
    </section>
  );
}
