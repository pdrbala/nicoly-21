export interface ScratchFx {
  trigger: (strength: number, direction: number) => void;
  dispose: () => void;
}

function createNoiseBuffer(ctx: AudioContext) {
  const length = Math.floor(ctx.sampleRate * 0.11);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    const fade = 1 - i / length;
    data[i] = (Math.random() * 2 - 1) * fade * fade;
  }

  return buffer;
}

export function createScratchFx(ctx: AudioContext): ScratchFx {
  const noise = createNoiseBuffer(ctx);
  let lastTrigger = 0;

  const trigger = (strength: number, direction: number) => {
    if (ctx.state !== 'running') return;

    const now = ctx.currentTime;
    if (now - lastTrigger < 0.018) return;
    lastTrigger = now;

    const amount = Math.min(1, Math.max(0, strength / 28));
    const source = ctx.createBufferSource();
    const highpass = ctx.createBiquadFilter();
    const bandpass = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    source.buffer = noise;
    source.playbackRate.value = 0.72 + amount * 1.15 + (direction < 0 ? 0.22 : 0);

    highpass.type = 'highpass';
    highpass.frequency.value = 520 + amount * 460;

    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1500 + amount * 1900;
    bandpass.Q.value = 0.9 + amount * 1.4;

    const peak = 0.018 + amount * 0.14;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.095);

    source.connect(highpass);
    highpass.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ctx.destination);

    source.start(now);
    source.stop(now + 0.11);
    source.addEventListener('ended', () => {
      source.disconnect();
      highpass.disconnect();
      bandpass.disconnect();
      gain.disconnect();
    });
  };

  return {
    trigger,
    dispose: () => {
      lastTrigger = 0;
    },
  };
}
