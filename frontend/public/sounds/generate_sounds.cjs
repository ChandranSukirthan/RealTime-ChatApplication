/**
 * Keyboard Sound Generator
 * Generates 6 synthetic keyboard sounds as WAV files:
 *   key_click_1.wav  – soft tap
 *   key_click_2.wav  – medium click
 *   key_click_3.wav  – crisp snap
 *   key_click_4.wav  – mechanical clack
 *   key_enter.wav    – send / enter sound
 *   key_backspace.wav– backspace / delete sound
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const OUT_DIR = __dirname;

// ─── WAV helpers ──────────────────────────────────────────────────────────────

function writeWav(filename, samples) {
  const numSamples = samples.length;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = SAMPLE_RATE * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);          // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }

  fs.writeFileSync(path.join(OUT_DIR, filename), buffer);
  console.log(`✔  Written: ${filename}`);
}

// ─── Envelope helpers ─────────────────────────────────────────────────────────

function envelope(t, attack, decay, sustain, release, duration) {
  if (t < attack) return t / attack;
  if (t < attack + decay) return 1 - (1 - sustain) * ((t - attack) / decay);
  if (t < duration - release) return sustain;
  return sustain * (1 - (t - (duration - release)) / release);
}

function generateSamples(durationSec, fn) {
  const n = Math.floor(SAMPLE_RATE * durationSec);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    out[i] = fn(t, i, n);
  }
  return out;
}

// ─── Noise utility ────────────────────────────────────────────────────────────

function noise() { return Math.random() * 2 - 1; }

// ─── Sound 1 – Soft tap (membrane keyboard) ───────────────────────────────────
function makeKeyClick1() {
  const dur = 0.06;
  return generateSamples(dur, (t) => {
    const env = Math.exp(-t * 80);
    const click = noise() * 0.6;
    const tone = Math.sin(2 * Math.PI * 1200 * t) * 0.3;
    return (click + tone) * env * 0.7;
  });
}

// ─── Sound 2 – Medium click (chiclet key) ────────────────────────────────────
function makeKeyClick2() {
  const dur = 0.08;
  return generateSamples(dur, (t) => {
    const env = Math.exp(-t * 60);
    const click = noise() * 0.5;
    const tone1 = Math.sin(2 * Math.PI * 900 * t) * 0.35;
    const tone2 = Math.sin(2 * Math.PI * 1800 * t) * 0.15;
    return (click + tone1 + tone2) * env * 0.8;
  });
}

// ─── Sound 3 – Crisp snap (laptop key) ───────────────────────────────────────
function makeKeyClick3() {
  const dur = 0.07;
  return generateSamples(dur, (t) => {
    const attack = Math.exp(-t * 150);
    const body   = Math.exp(-t * 40) * 0.4;
    const env = attack + body;
    const high = Math.sin(2 * Math.PI * 3200 * t + Math.sin(2 * Math.PI * 160 * t));
    const mid  = noise() * 0.4;
    return (high * 0.4 + mid) * env * 0.75;
  });
}

// ─── Sound 4 – Mechanical clack (MX-style) ───────────────────────────────────
function makeKeyClick4() {
  const dur = 0.12;
  return generateSamples(dur, (t) => {
    // Two-stage: initial click + bottom-out thud
    const click = Math.exp(-t * 200) * (noise() * 0.8 + Math.sin(2 * Math.PI * 2400 * t) * 0.5);
    const thud  = Math.exp(-(t - 0.012) * 50) * (t > 0.012 ? noise() * 0.5 : 0);
    const tone  = Math.sin(2 * Math.PI * 600 * t) * Math.exp(-t * 30) * 0.3;
    return (click + thud + tone) * 0.8;
  });
}

// ─── Sound 5 – Enter / Send ────────────────────────────────────────────────────
function makeKeyEnter() {
  const dur = 0.18;
  return generateSamples(dur, (t) => {
    // Deeper, slightly longer thud with a subtle pitch drop
    const freq = 520 - t * 900;
    const tone = Math.sin(2 * Math.PI * Math.max(200, freq) * t);
    const env  = Math.exp(-t * 28);
    const n    = noise() * 0.35;
    return (tone * 0.55 + n) * env * 0.85;
  });
}

// ─── Sound 6 – Backspace / Delete ─────────────────────────────────────────────
function makeKeyBackspace() {
  const dur = 0.10;
  return generateSamples(dur, (t) => {
    // Light double-tap feel
    const tap1 = Math.exp(-t * 120) * (noise() * 0.5 + Math.sin(2 * Math.PI * 1500 * t) * 0.3);
    const tap2 = t > 0.03
      ? Math.exp(-(t - 0.03) * 100) * (noise() * 0.35 + Math.sin(2 * Math.PI * 1100 * t) * 0.2)
      : 0;
    return (tap1 + tap2) * 0.75;
  });
}

// ─── Generate all ─────────────────────────────────────────────────────────────
writeWav('key_click_1.wav',   makeKeyClick1());
writeWav('key_click_2.wav',   makeKeyClick2());
writeWav('key_click_3.wav',   makeKeyClick3());
writeWav('key_click_4.wav',   makeKeyClick4());
writeWav('key_enter.wav',     makeKeyEnter());
writeWav('key_backspace.wav', makeKeyBackspace());

console.log('\n🎹 All 6 keyboard sounds generated successfully!');
