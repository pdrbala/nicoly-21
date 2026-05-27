import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const DEFAULT_TRACKS = {
  vessel: {
    artist: 'Twenty One Pilots',
    track: 'Semi-Automatic',
    album: 'Vessel',
    audio: 'public/audio/vessel.mp3',
    output: 'public/lyrics/vessel.lrc',
  },
  blurry: {
    artist: 'Twenty One Pilots',
    track: 'Heavydirtysoul',
    album: 'Blurryface',
    audio: 'public/audio/blurryface.mp3',
    output: 'public/lyrics/blurry.lrc',
  },
  trench: {
    artist: 'Twenty One Pilots',
    track: 'The Hype',
    album: 'Trench',
    audio: 'public/audio/trench.mp3',
    output: 'public/lyrics/trench.lrc',
  },
  sai: {
    artist: 'Twenty One Pilots',
    track: 'Choker',
    album: 'Scaled And Icy',
    audio: 'public/audio/sai.mp3',
    output: 'public/lyrics/sai.lrc',
  },
  clancy: {
    artist: 'Twenty One Pilots',
    track: 'Oldies Station',
    album: 'Clancy',
    audio: 'public/audio/clancy.mp3',
    output: 'public/lyrics/clancy.lrc',
  },
  breach: {
    artist: 'Twenty One Pilots',
    track: 'Tally',
    album: 'Breach',
    audio: 'public/audio/breach.mp3',
    output: 'public/lyrics/breach.lrc',
  },
};

const BITRATES = {
  '1-1': [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448],
  '1-2': [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384],
  '1-3': [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  '2-1': [0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256],
  '2-2': [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
  '2-3': [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
};

const SAMPLE_RATES = {
  1: [44100, 48000, 32000],
  2: [22050, 24000, 16000],
  2.5: [11025, 12000, 8000],
};

function readArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const [key, inlineValue] = arg.slice(2).split('=');
    const next = argv[i + 1];
    if (inlineValue !== undefined) args[key] = inlineValue;
    else if (next && !next.startsWith('--')) args[key] = argv[++i];
    else args[key] = true;
  }
  return args;
}

function normalize(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getId3Offset(data) {
  if (data.subarray(0, 3).toString() !== 'ID3') return 0;

  const size =
    ((data[6] & 0x7f) << 21) |
    ((data[7] & 0x7f) << 14) |
    ((data[8] & 0x7f) << 7) |
    (data[9] & 0x7f);
  return 10 + size;
}

function readFrame(data, index) {
  if (data[index] !== 0xff || (data[index + 1] & 0xe0) !== 0xe0) return null;

  const versionBits = (data[index + 1] >> 3) & 3;
  const layerBits = (data[index + 1] >> 1) & 3;
  const bitrateIndex = (data[index + 2] >> 4) & 15;
  const sampleRateIndex = (data[index + 2] >> 2) & 3;
  const padding = (data[index + 2] >> 1) & 1;
  const version = versionBits === 3 ? 1 : versionBits === 2 ? 2 : versionBits === 0 ? 2.5 : null;
  const layer = layerBits === 3 ? 1 : layerBits === 2 ? 2 : layerBits === 1 ? 3 : null;

  if (!version || !layer || bitrateIndex === 0 || bitrateIndex === 15 || sampleRateIndex === 3) {
    return null;
  }

  const bitrateVersion = version === 1 ? 1 : 2;
  const bitrate = BITRATES[`${bitrateVersion}-${layer}`][bitrateIndex] * 1000;
  const sampleRate = SAMPLE_RATES[version][sampleRateIndex];
  const samples = layer === 1 ? 384 : layer === 3 && version !== 1 ? 576 : 1152;
  const frameLength =
    layer === 1
      ? Math.floor((12 * bitrate) / sampleRate + padding) * 4
      : Math.floor(((samples / 8) * bitrate) / sampleRate + padding);

  if (frameLength <= 0) return null;
  return { frameLength, seconds: samples / sampleRate };
}

async function readMp3Duration(path) {
  const data = await readFile(resolve(path));
  let duration = 0;
  let frames = 0;

  for (let i = getId3Offset(data); i + 4 < data.length; ) {
    const frame = readFrame(data, i);
    if (!frame) {
      i++;
      continue;
    }

    duration += frame.seconds;
    frames++;
    i += frame.frameLength;
  }

  return frames > 0 ? duration : null;
}

function buildTrack(args) {
  const preset = args.era ? DEFAULT_TRACKS[args.era] : null;
  const track = {
    artist: args.artist ?? preset?.artist,
    track: args.track ?? preset?.track,
    album: args.album ?? preset?.album,
    audio: args.audio ?? preset?.audio,
    duration: Number(args.duration ?? preset?.duration ?? 0) || null,
    output: args.output ?? preset?.output,
  };

  if (!track.artist || !track.track || !track.output) {
    throw new Error(
      'Use --era vessel or pass --artist, --track and --output. Optional: --album, --duration.'
    );
  }

  return track;
}

function scoreCandidate(candidate, track) {
  if (!candidate.syncedLyrics) return -Infinity;

  let score = 100;
  if (normalize(candidate.trackName) === normalize(track.track)) score += 45;
  if (normalize(candidate.artistName) === normalize(track.artist)) score += 35;
  if (track.album && normalize(candidate.albumName) === normalize(track.album)) score += 25;
  if (track.duration && Number.isFinite(candidate.duration)) {
    score += Math.max(0, 18 - Math.abs(candidate.duration - track.duration));
  }

  return score;
}

async function fetchLyrics(track) {
  const url = new URL('https://lrclib.net/api/search');
  url.searchParams.set('track_name', track.track);
  url.searchParams.set('artist_name', track.artist);
  if (track.album) url.searchParams.set('album_name', track.album);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'nicoly-21/0.1 (local synced lyrics fetcher)',
    },
  });

  if (!response.ok) {
    throw new Error(`LRCLIB request failed: ${response.status} ${response.statusText}`);
  }

  const results = await response.json();
  const best = results
    .map((candidate) => ({ candidate, score: scoreCandidate(candidate, track) }))
    .sort((a, b) => b.score - a.score)[0]?.candidate;

  if (!best?.syncedLyrics) {
    throw new Error(`No synced LRCLIB result found for "${track.track}".`);
  }

  return best;
}

function countSyncedLines(lrc) {
  return lrc
    .split(/\r?\n/)
    .filter((line) => /^\[\d{1,3}:\d{2}(?:\.\d{1,3})?\]/.test(line) && line.replace(/\[[^\]]+\]/g, '').trim())
    .length;
}

async function main() {
  const args = readArgs(process.argv);
  const track = buildTrack(args);
  const localDuration = track.audio ? await readMp3Duration(track.audio) : null;
  if (!args.duration && localDuration) {
    track.duration = localDuration;
  }
  const result = await fetchLyrics(track);
  const output = resolve(track.output);
  const metaOutput = output.replace(/\.lrc$/i, '.lrclib.json');

  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${result.syncedLyrics.trim()}\n`, 'utf8');
  await writeFile(
    metaOutput,
    `${JSON.stringify(
      {
        provider: 'LRCLIB',
        providerUrl: 'https://lrclib.net',
        fetchedAt: new Date().toISOString(),
        id: result.id,
        trackName: result.trackName,
        artistName: result.artistName,
        albumName: result.albumName,
        duration: result.duration,
        localDuration,
        instrumental: result.instrumental,
        syncedLineCount: countSyncedLines(result.syncedLyrics),
      },
      null,
      2
    )}\n`,
    'utf8'
  );

  console.log(
    `Saved ${track.output} from LRCLIB id ${result.id} (${countSyncedLines(result.syncedLyrics)} timed lines).`
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
