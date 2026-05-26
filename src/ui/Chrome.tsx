import { useEraStore } from '../store/useEraStore';
import { ERA_BY_ID } from '../data/eras';

export function Chrome() {
  const selected = useEraStore((s) => s.selected);
  const era = selected ? ERA_BY_ID[selected] : null;
  const state = era ? 'now spinning' : 'stand by';
  return (
    <header className="chrome">
      <div>
        SIDE A · <b>NICOLY</b>
      </div>
      <div className="center">
        <span className="live" /> <span>{state}</span>
      </div>
      <div>
        33⅓ RPM · <b>05.06.26</b>
      </div>
    </header>
  );
}
