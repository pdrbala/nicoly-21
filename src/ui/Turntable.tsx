import { useEraStore } from '../store/useEraStore';
import { ERA_BY_ID } from '../data/eras';

export function Turntable() {
  const selected = useEraStore((s) => s.selected);
  const era = selected ? ERA_BY_ID[selected] : null;
  return (
    <div className="turntable">
      <div className="deck">
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
