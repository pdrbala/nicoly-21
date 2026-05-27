interface TonearmProps {
  onPointerDown?: (e: React.PointerEvent<SVGGElement>) => void;
}

/**
 * SVG tonearm. The wrapper <svg> is what gets rotated by the parent CSS
 * (.tonearm class on its container). Inside, we draw:
 *   - counterweight (the dark cylinder behind the pivot)
 *   - pivot housing
 *   - the arm tube (a straight bar with a slight metallic gradient)
 *   - the headshell at the tip, angled to sit flat on the disc
 *   - the cartridge/needle stinger touching the groove
 *
 * The optional `onPointerDown` makes the arm draggable — only painted SVG
 * shapes capture events (visiblePainted is the SVG default), so empty space
 * between elements still passes clicks through to the disc underneath.
 */
export function TonearmSVG({ onPointerDown }: TonearmProps) {
  return (
    <svg
      viewBox="0 0 300 320"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="arm-tube" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4c7b9" />
          <stop offset="35%" stopColor="#b8a99c" />
          <stop offset="100%" stopColor="#7a6c5e" />
        </linearGradient>
        <linearGradient id="pivot-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3530" />
          <stop offset="55%" stopColor="#1a1612" />
          <stop offset="100%" stopColor="#0a0807" />
        </linearGradient>
        <linearGradient id="weight-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1a1612" />
          <stop offset="55%" stopColor="#2a2520" />
          <stop offset="100%" stopColor="#0e0a08" />
        </linearGradient>
        <linearGradient id="head-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2520" />
          <stop offset="100%" stopColor="#0a0807" />
        </linearGradient>
        <filter id="drop">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.55" />
        </filter>
      </defs>

      {/* Counterweight — sits BEHIND the pivot, opposite the arm */}
      <g className="tonearm-hit" onPointerDown={onPointerDown}>
      <g transform="translate(245, 28) rotate(-10)">
        <rect x="-2" y="-14" width="46" height="28" rx="6" fill="url(#weight-grad)" filter="url(#drop)" />
        {/* light streak */}
        <rect x="2" y="-12" width="38" height="2" rx="1" fill="rgba(255,255,255,0.12)" />
      </g>

      {/* Arm tube — from pivot down-left to the headshell */}
      <g transform="translate(238, 28)" filter="url(#drop)">
        {/* main tube */}
        <path
          d="M 0 0 L -180 240"
          stroke="url(#arm-tube)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        {/* highlight on top edge */}
        <path
          d="M 0 0 L -180 240"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          transform="translate(-1.2, -1.6)"
        />
        {/* small joint dot where arm meets the pivot */}
        <circle r="3.5" fill="#1a1612" />
      </g>

      {/* Pivot housing — the cylinder the arm rotates on */}
      <g transform="translate(238, 28)" filter="url(#drop)">
        <circle r="18" fill="url(#pivot-grad)" />
        <circle r="14" fill="#0a0807" />
        <circle r="4" fill="#2a2520" />
        {/* spec highlight */}
        <circle r="18" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      </g>

      {/* Headshell at the tip of the arm. The arm direction is (-180, 240)
          from (238, 28), so the tip is at (58, 268). The headshell sits
          slightly past that point and is rotated so its bottom edge is
          roughly parallel with the disc tangent. */}
      <g transform="translate(50, 274) rotate(-37)" filter="url(#drop)">
        {/* connector neck */}
        <rect x="-6" y="-3" width="14" height="6" rx="1" fill="#1a1612" />
        {/* main headshell body */}
        <path
          d="M 8 -10 L 56 -7 L 56 7 L 8 10 Z"
          fill="url(#head-grad)"
        />
        {/* shell top highlight */}
        <path
          d="M 8 -9 L 56 -6"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
          fill="none"
        />
        {/* cartridge — small block under the shell */}
        <rect x="34" y="6" width="14" height="6" rx="1" fill="#0a0606" />
        {/* needle/stylus tip */}
        <path d="M 41 11 L 39 16 L 43 16 Z" fill="#1f1816" />
      </g>
      </g>
    </svg>
  );
}
