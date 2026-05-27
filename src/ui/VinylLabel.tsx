interface Props {
  name: string;
  year: string;
  track: string;
  active: boolean;
}

/**
 * SVG inside .label-disc — the curved text that wraps around the label like
 * a real pressing. Two arcs (top: album name, bottom: SIDE A) + a flat
 * center stack (track code / year). The center pin hole sits above this via
 * .label-disc::after pseudo-element.
 */
export function VinylLabel({ name, year, track, active }: Props) {
  return (
    <svg
      className={`label-svg ${active ? 'is-active' : ''}`}
      viewBox="0 0 180 180"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Top arc — clockwise, text reads L→R hugging the upper rim */}
        <path id="lbl-arc-top" d="M 26 90 A 64 64 0 0 1 154 90" fill="none" />
        {/* Bottom arc — counterclockwise, letters upright on the lower rim */}
        <path id="lbl-arc-bot" d="M 26 90 A 64 64 0 0 0 154 90" fill="none" />
      </defs>

      {/* faint inner ring + outer ring for that pressed-vinyl look */}
      <circle cx="90" cy="90" r="78" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
      <circle cx="90" cy="90" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />

      {/* Top arc — album name in italic serif */}
      <text className="lbl-name">
        <textPath href="#lbl-arc-top" startOffset="50%" textAnchor="middle">
          {name}
        </textPath>
      </text>

      {/* Bottom arc — pressing info */}
      <text className="lbl-side">
        <textPath href="#lbl-arc-bot" startOffset="50%" textAnchor="middle">
          {`SIDE A · NICOLY 21 · ${year}`}
        </textPath>
      </text>

      {/* Center stack — small flat text near the spindle */}
      <text x="90" y="80" textAnchor="middle" className="lbl-track">
        {track}
      </text>
      <text x="90" y="104" textAnchor="middle" className="lbl-mini">
        LIMITED PRESS · 1/1
      </text>
    </svg>
  );
}
