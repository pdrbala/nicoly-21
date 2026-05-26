import { usePlaybackStore } from '../store/usePlaybackStore';

export function AudioToggle() {
  const crackle = usePlaybackStore((s) => s.crackle);
  const toggle = usePlaybackStore((s) => s.toggleCrackle);
  return (
    <button className={`audio ${crackle ? 'on' : ''}`} onClick={toggle}>
      <span className="d" />
      <span className="lbl">Crackle · {crackle ? 'on' : 'off'}</span>
    </button>
  );
}
