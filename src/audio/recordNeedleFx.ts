const ENABLE_RECORD_NEEDLE_FX = true;

let ctx: AudioContext | null = null;

export function playNeedleDropFx() {
  playNeedleFx({ duration: 0.38, startFreq: 1400, endFreq: 260, gain: 0.085 });
}

export function playNeedleLiftFx() {
  playNeedleFx({ duration: 0.22, startFreq: 520, endFreq: 1900, gain: 0.055 });
}

function playNeedleFx({
  duration,
  startFreq,
  endFreq,
  gain,
}: {
  duration: number;
  startFreq: number;
  endFreq: number;
  gain: number;
}) {
  if (!ENABLE_RECORD_NEEDLE_FX) return;

  const audioCtx = getContext();
  if (!audioCtx) return;

  const sampleRate = audioCtx.sampleRate;
  const length = Math.max(1, Math.floor(sampleRate * duration));
  const buffer = audioCtx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i += 1) {
    const t = i / length;
    const burst = Math.random() * 2 - 1;
    const scrape = Math.sin(i * lerp(startFreq, endFreq, t) * 0.00018);
    const envelope = Math.pow(1 - t, 1.8);
    data[i] = (burst * 0.76 + scrape * 0.24) * envelope;
  }

  const source = audioCtx.createBufferSource();
  const filter = audioCtx.createBiquadFilter();
  const output = audioCtx.createGain();
  const now = audioCtx.currentTime;

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(startFreq, now);
  filter.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
  filter.Q.value = 1.1;

  output.gain.setValueAtTime(gain, now);
  output.gain.exponentialRampToValueAtTime(0.001, now + duration);

  source.buffer = buffer;
  source.connect(filter);
  filter.connect(output);
  output.connect(audioCtx.destination);
  source.start(now);
  source.stop(now + duration);
}

function getContext() {
  try {
    if (!ctx || ctx.state === 'closed') {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
