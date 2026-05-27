#!/usr/bin/env node
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, resolve } from 'node:path';

const API_URL = 'https://api.openai.com/v1/audio/transcriptions';
const DEFAULT_MODEL = 'whisper-1';
const DEFAULT_GAP_SECONDS = 2.25;
const DEFAULT_DISPLAY_LEAD_SECONDS = 0.35;
const ERA_AUDIO = {
  vessel: 'vessel',
  blurry: 'blurryface',
  trench: 'trench',
  sai: 'sai',
  clancy: 'clancy',
  breach: 'breach',
};

function parseArgs(argv) {
  const args = {
    audio: '',
    out: '',
    model: DEFAULT_MODEL,
    language: 'en',
    minGap: DEFAULT_GAP_SECONDS,
    displayLead: DEFAULT_DISPLAY_LEAD_SECONDS,
    prompt: '',
    era: '',
  };

  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === '--audio') args.audio = value;
    else if (key === '--out') args.out = value;
    else if (key === '--model') args.model = value;
    else if (key === '--language') args.language = value;
    else if (key === '--min-gap') args.minGap = Number(value);
    else if (key === '--display-lead') args.displayLead = Number(value);
    else if (key === '--prompt') args.prompt = value;
    else if (key === '--era') args.era = value;
    else if (key === '--help' || key === '-h') args.help = true;
    if (key.startsWith('--')) i++;
  }

  return args;
}

function printHelp() {
  console.log(`
Usage:
  npm run lyrics:transcribe -- --audio public/audio/vessel.mp3 --out public/lyrics/vessel

Options:
  --audio      Audio file to transcribe. Required.
  --era        Era id. When present, defaults to public/audio/<era>.mp3 and public/lyrics/<era>.
  --out        Output path without extension. Defaults beside audio filename or public/lyrics/<era>.
  --model      Transcription model. Default: ${DEFAULT_MODEL}
  --language   ISO language hint. Default: en
  --min-gap    Seconds without words before marking instrumental. Default: ${DEFAULT_GAP_SECONDS}
  --display-lead Seconds to visually advance lyric highlighting. Default: ${DEFAULT_DISPLAY_LEAD_SECONDS}
  --prompt     Optional transcription prompt, useful for artist/title vocabulary.
`);
}

function requireOption(value, label) {
  if (!value) throw new Error(`Missing ${label}. Run with --help for usage.`);
}

function contentTypeFor(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (ext === '.mp3') return 'audio/mpeg';
  if (ext === '.m4a') return 'audio/mp4';
  if (ext === '.mp4') return 'audio/mp4';
  if (ext === '.wav') return 'audio/wav';
  if (ext === '.webm') return 'audio/webm';
  if (ext === '.mpeg' || ext === '.mpga') return 'audio/mpeg';
  return 'application/octet-stream';
}

function toClock(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safe / 60);
  const secs = safe - minutes * 60;
  return `${String(minutes).padStart(2, '0')}:${secs.toFixed(2).padStart(5, '0')}`;
}

function normalizeWord(raw) {
  return {
    text: String(raw.word ?? raw.text ?? '').trim(),
    start: Number(raw.start ?? 0),
    end: Number(raw.end ?? raw.start ?? 0),
  };
}

function normalizeSegment(raw, index) {
  return {
    id: Number(raw.id ?? index),
    type: 'vocal',
    start: Number(raw.start ?? 0),
    end: Number(raw.end ?? raw.start ?? 0),
    text: String(raw.text ?? '').trim(),
    avgLogprob: raw.avg_logprob,
    noSpeechProb: raw.no_speech_prob,
  };
}

function buildTimeline(segments, duration, minGap) {
  const timeline = [];
  let cursor = 0;

  for (const segment of segments) {
    if (segment.start - cursor >= minGap) {
      timeline.push({
        type: 'instrumental',
        start: cursor,
        end: segment.start,
        text: '',
      });
    }
    timeline.push(segment);
    cursor = Math.max(cursor, segment.end);
  }

  if (duration - cursor >= minGap) {
    timeline.push({
      type: 'instrumental',
      start: cursor,
      end: duration,
      text: '',
    });
  }

  return timeline;
}

function buildLrc(timeline) {
  return timeline
    .map((item) => {
      if (item.type === 'instrumental') {
        return `[${toClock(item.start)}-${toClock(item.end)}][instrumental]`;
      }
      return `[${toClock(item.start)}-${toClock(item.end)}]${item.text}`;
    })
    .join('\n');
}

async function transcribe({ audio, model, language, prompt }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set. Set it before running the transcription script.');
  }

  const audioPath = resolve(audio);
  const audioBytes = await readFile(audioPath);
  const form = new FormData();
  form.append('file', new Blob([audioBytes], { type: contentTypeFor(audioPath) }), basename(audioPath));
  form.append('model', model);
  form.append('response_format', 'verbose_json');
  form.append('timestamp_granularities[]', 'segment');
  form.append('timestamp_granularities[]', 'word');
  if (language) form.append('language', language);
  if (prompt) form.append('prompt', prompt);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Transcription failed (${response.status}): ${text}`);
  }

  return JSON.parse(text);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  if (args.era && !args.audio) {
    const audioName = ERA_AUDIO[args.era] || args.era;
    args.audio = `public/audio/${audioName}.mp3`;
  }
  requireOption(args.audio, '--audio or --era');
  if (!Number.isFinite(args.minGap) || args.minGap < 0) {
    throw new Error('--min-gap must be a positive number.');
  }
  if (!Number.isFinite(args.displayLead) || args.displayLead < 0) {
    throw new Error('--display-lead must be a positive number.');
  }

  const baseOut = resolve(args.out || (args.era ? `public/lyrics/${args.era}` : args.audio.replace(/\.[^.]+$/, '')));
  const raw = await transcribe(args);
  const duration = Number(raw.duration ?? 0);
  const segments = (raw.segments ?? []).map(normalizeSegment);
  const words = (raw.words ?? []).map(normalizeWord).filter((word) => word.text);
  const timeline = buildTimeline(segments, duration, args.minGap);

  const result = {
    source: resolve(args.audio),
    generatedAt: new Date().toISOString(),
    model: args.model,
    language: raw.language ?? args.language,
    duration,
    minInstrumentalGap: args.minGap,
    displayLeadSeconds: args.displayLead,
    text: raw.text ?? '',
    timeline,
    segments,
    words,
    raw,
  };

  await mkdir(dirname(baseOut), { recursive: true });
  await writeFile(`${baseOut}.timed.json`, `${JSON.stringify(result, null, 2)}\n`);
  await writeFile(`${baseOut}.lrc`, `${buildLrc(timeline)}\n`);

  console.log(`Wrote ${baseOut}.timed.json`);
  console.log(`Wrote ${baseOut}.lrc`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
