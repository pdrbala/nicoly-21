import { useEraStore } from '../store/useEraStore';
import { ERA_BY_ID } from '../data/eras';

export function LinerNotes() {
  const selected = useEraStore((s) => s.selected);
  const era = selected ? ERA_BY_ID[selected] : null;
  return (
    <div className="liner">
      <div className="liner-kicker">
        <span className="dot" />
        <span>{era ? 'now spinning' : '— stand by —'}</span>
      </div>
      <div className="liner-side">
        Faixa <b>{era ? era.track : '— —'}</b> &nbsp;·&nbsp; <b>de 06</b>
      </div>
      <div className="liner-title">{era ? era.name : 'selecione uma faixa'}</div>
      <div className="liner-sub">
        {era ? `— ${era.year} · ${era.trackLabel} —` : '— escolha um lado A abaixo —'}
      </div>
      <div className="liner-divider" />
      <div className="liner-quote">
        {era ? `"${era.phrase}"` : '"o disco está parado, esperando a agulha."'}
      </div>
      <div className="liner-meta">
        <span>FAIXA</span>
        <span>
          <b className="dyn">{era ? era.track : '— —'}</b>
        </span>
        <span>ANO</span>
        <span>
          <b className="dyn">{era ? era.year : '— —'}</b>
        </span>
        <span>GRAVADO POR</span>
        <span>
          <b>Pedro Guilherme</b>
        </span>
        <span>PARA</span>
        <span>
          <b>Nicoly</b> · 21 anos
        </span>
      </div>
    </div>
  );
}
