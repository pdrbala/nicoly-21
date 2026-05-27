import { useEffect, useRef } from 'react';
import { useEraStore } from '../store/useEraStore';
import { usePlaybackStore } from '../store/usePlaybackStore';
import { ERAS } from '../data/eras';
import { toggle as togglePlay } from '../audio/playerControls';

const COVER_CLASS: Record<string, string> = {
  vessel: 'cover-vessel',
  blurry: 'cover-blurry',
  trench: 'cover-trench',
  sai: 'cover-sai',
  clancy: 'cover-clancy',
  breach: 'cover-breach',
};

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 1.5 L13 8 L3 14.5 Z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="3" y="2" width="3.5" height="12" />
      <rect x="9.5" y="2" width="3.5" height="12" />
    </svg>
  );
}

export function DialShelf() {
  const selected = useEraStore((s) => s.selected);
  const select = useEraStore((s) => s.select);
  const playing = usePlaybackStore((s) => s.playing);
  const activeCardRef = useRef<HTMLDivElement>(null);

  // Drive the active card's "breathing" scale from a single RAF that reads
  // the store imperatively (no re-render thrash).
  useEffect(() => {
    const card = activeCardRef.current;
    if (!card) return;
    let raf = 0;
    const loop = () => {
      const { level } = usePlaybackStore.getState();
      const scale = 1.025 + level * 0.06;
      card.style.transform = `translateY(-10px) scale(${scale.toFixed(4)})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [selected]);

  const onPlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlay();
  };

  return (
    <div className="dial-wrap">
      <div className="dial">
        <div className={`shelf ${selected ? 'has-active' : ''}`}>
          {ERAS.map((e, i) => {
            const isActive = e.id === selected;
            return (
              <div
                key={e.id}
                ref={isActive ? activeCardRef : null}
                className={`album-card ${isActive ? 'active pulsing' : ''}`}
                style={
                  {
                    ['--card-glow' as any]: e.glow,
                    ['--card-accent' as any]: e.accent,
                  } as React.CSSProperties
                }
                onClick={() => select(e.id)}
              >
                <div className={`cover ${COVER_CLASS[e.id]}`}>
                  <img
                    src={e.coverImage}
                    alt={e.name}
                    className="cover-img"
                    loading="lazy"
                    onError={(ev) => {
                      (ev.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                {isActive && <span className="album-pin" aria-hidden="true" />}
                <div className="info">
                  <div className="track">A{i + 1}</div>
                  <div className="nm">{e.name}</div>
                  <div className="yr">— {e.year} —</div>
                </div>
                {isActive && (
                  <div className="player">
                    <button
                      className="pp"
                      onClick={onPlayPause}
                      aria-label={playing ? 'pause' : 'play'}
                    >
                      {playing ? <PauseIcon /> : <PlayIcon />}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
