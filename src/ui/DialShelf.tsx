import { useEffect, useRef } from 'react';
import { useEraStore } from '../store/useEraStore';
import { usePlaybackStore } from '../store/usePlaybackStore';
import { ERAS, ERA_BY_ID } from '../data/eras';

const COVER_CLASS: Record<string, string> = {
  vessel: 'cover-vessel',
  blurry: 'cover-blurry',
  trench: 'cover-trench',
  sai: 'cover-sai',
  clancy: 'cover-clancy',
  breach: 'cover-breach',
};

export function DialShelf() {
  const selected = useEraStore((s) => s.selected);
  const select = useEraStore((s) => s.select);
  const wrapRef = useRef<HTMLDivElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);
  const activeCardRef = useRef<HTMLDivElement>(null);
  const era = selected ? ERA_BY_ID[selected] : null;

  // position needle over active card center
  useEffect(() => {
    const update = () => {
      const wrap = wrapRef.current;
      const active = wrap?.querySelector('.album-card.active') as HTMLElement | null;
      const needle = needleRef.current;
      if (!wrap || !active || !needle) return;
      const wr = wrap.getBoundingClientRect();
      const cr = active.getBoundingClientRect();
      const cx = cr.left + cr.width / 2 - wr.left;
      needle.style.left = `${(cx / wr.width) * 100}%`;
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [selected]);

  // pulse the active card with audio level (subscribe directly to avoid re-renders)
  useEffect(() => {
    const card = activeCardRef.current;
    if (!card) return;
    let raf = 0;
    const loop = () => {
      const lv = usePlaybackStore.getState().level;
      const scale = 1.025 + lv * 0.06;
      card.style.transform = `translateY(-10px) scale(${scale.toFixed(4)})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [selected]);

  return (
    <div className="dial-wrap" ref={wrapRef}>
      <div className="dial-head">
        <span>
          SIDE A · <b>NICOLY</b> · 6 FAIXAS
        </span>
        <span className="right">
          SELECIONE · <b>{era ? `${era.track} · ${era.name}` : 'stand by'}</b>
        </span>
      </div>
      <div className="dial">
        <div className="dial-rail">
          <div className="dial-line" />
          <div className="dial-needle" ref={needleRef} style={{ left: '50%' }} />
        </div>
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
                <div className={`cover ${COVER_CLASS[e.id]}`} />
                <div className="info">
                  <div className="track">A{i + 1}</div>
                  <div className="nm">{e.name}</div>
                  <div className="yr">— {e.year} —</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
