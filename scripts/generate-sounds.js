const fs = require('fs');
const path = require('path');

const SR = 22050;

function writeWav(filename, samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-32767, Math.min(32767, Math.round(samples[i] * 32767)));
    buf.writeInt16LE(s, 44 + i * 2);
  }
  fs.writeFileSync(filename, buf);
}

function tone(freq, dur, vol = 0.5, attackMs = 8, releaseMs = 40) {
  const n = Math.floor(SR * dur);
  const atk = Math.floor(SR * attackMs / 1000);
  const rel = Math.floor(SR * releaseMs / 1000);
  return Array.from({ length: n }, (_, i) => {
    let env = 1;
    if (i < atk) env = i / atk;
    else if (i > n - rel) env = (n - i) / rel;
    return env * vol * Math.sin(2 * Math.PI * freq * i / SR);
  });
}

function silence(dur) {
  return new Array(Math.floor(SR * dur)).fill(0);
}

function cat(...arrs) {
  return [].concat(...arrs);
}

const dir = path.join(__dirname, '../assets/sounds');

// correct.wav — rising happy ding (C5 E5 G5)
writeWav(path.join(dir, 'correct.wav'), cat(
  tone(523, 0.07, 0.5, 5, 15),
  tone(659, 0.07, 0.5, 5, 15),
  tone(784, 0.18, 0.6, 5, 70),
));

// wrong.wav — sad descending thud
writeWav(path.join(dir, 'wrong.wav'), cat(
  tone(280, 0.08, 0.55, 5, 10),
  tone(210, 0.22, 0.45, 5, 100),
));

// success.wav — victory fanfare arpeggio (C E G C5 E5)
writeWav(path.join(dir, 'success.wav'), cat(
  tone(262, 0.09, 0.5, 4, 12),
  tone(330, 0.09, 0.5, 4, 12),
  tone(392, 0.09, 0.5, 4, 12),
  tone(523, 0.09, 0.5, 4, 12),
  tone(659, 0.40, 0.6, 4, 150),
));

// fail.wav — sad descending notes (G E C A2)
writeWav(path.join(dir, 'fail.wav'), cat(
  tone(392, 0.11, 0.5, 5, 18),
  tone(330, 0.11, 0.5, 5, 18),
  tone(262, 0.11, 0.5, 5, 18),
  tone(196, 0.38, 0.5, 5, 140),
));

// tick.wav — short click for countdown
writeWav(path.join(dir, 'tick.wav'), tone(900, 0.055, 0.45, 2, 25));

// hint.wav — sparkle ascending arpeggio
writeWav(path.join(dir, 'hint.wav'), cat(
  tone(784, 0.055, 0.4, 2, 12),
  tone(988, 0.055, 0.4, 2, 12),
  tone(1175, 0.14, 0.5, 2, 65),
));

// music.wav — simple looping melody (120 bpm)
const beat = 60 / 120;
const q = beat / 2;
const e = beat / 4;
const melody = [
  [523, q], [587, e], [659, e],
  [784, q], [659, q],
  [587, q], [523, q],
  [523, beat], [0, q],
  [659, q], [587, e], [523, e],
  [587, q], [659, q],
  [784, q], [880, e], [784, e],
  [659, beat], [0, q],
];
const bassline = [
  [262, beat], [262, beat],
  [220, beat], [220, beat],
  [196, beat], [196, beat],
  [220, beat], [220, beat],
];
function makeMelody(notes) {
  return notes.flatMap(([freq, dur]) =>
    freq === 0 ? silence(dur) : cat(tone(freq, dur * 0.88, 0.22, 5, 18), silence(dur * 0.12))
  );
}
function makeBass(notes) {
  return notes.flatMap(([freq, dur]) =>
    cat(tone(freq, dur * 0.7, 0.15, 8, 30), silence(dur * 0.3))
  );
}
const melodyTrack = makeMelody(melody);
const bassTrack = makeBass(bassline);
// Mix melody + bass (pad shorter one with silence)
const musicLen = Math.max(melodyTrack.length, bassTrack.length);
const musicMix = Array.from({ length: musicLen }, (_, i) =>
  (melodyTrack[i] ?? 0) + (bassTrack[i] ?? 0)
);
// Loop 6x for a ~30s track before it repeats
writeWav(path.join(dir, 'music.wav'), [
  ...musicMix, ...musicMix, ...musicMix,
  ...musicMix, ...musicMix, ...musicMix,
]);

console.log('Generated assets/sounds: correct, wrong, success, fail, tick, hint, music');
