import { useEraStore } from '../store/useEraStore';
import { ERA_BY_ID } from '../data/eras';
import { toggle as togglePlay } from '../audio/playerControls';

export function Turntable() {
  const selected = useEraStore((s) => s.selected);
  const era = selected ? ERA_BY_ID[selected] : null;

  // Clicking the deck toggles play/pause — only meaningful once an era is selected.
  const onDeckClick = () => {
    if (!selected) return;
    togglePlay();
  };

  return (
    <div className="turntable">
      <div
        className="deck"
        onClick={onDeckClick}
        role={selected ? 'button' : undefined}
        aria-label={selected ? 'play/pause' : undefined}
      >
        <div className="platter" />
        <div className="label-disc">
          <div className="label-inner">
            <div className="alb">{era ? era.name : '— —'}</div>
            <div className="yr">{era ? `— ${era.year} —` : 'stand by'}</div>
            <div className="nic">a side · nicoly</div>
          </div>
        </div>
      </div>
      <div className="tonearm">
        <div className="tonearm-pivot" />
        <div className="tonearm-bar" />
        <div className="tonearm-head" />
      </div>
    </div>
  );
}
