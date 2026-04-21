import { Audio } from 'expo-av';

const SOUND_FILES = {
  correct: require('../assets/sounds/correct.wav'),
  wrong:   require('../assets/sounds/wrong.wav'),
  success: require('../assets/sounds/success.wav'),
  fail:    require('../assets/sounds/fail.wav'),
  tick:    require('../assets/sounds/tick.wav'),
  hint:    require('../assets/sounds/hint.wav'),
};

let sounds = {};
let music = null;
let sfxEnabled = true;
let musicEnabled = true;

export async function initAudio() {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    const entries = await Promise.all(
      Object.entries(SOUND_FILES).map(async ([key, file]) => {
        const { sound } = await Audio.Sound.createAsync(file);
        return [key, sound];
      })
    );
    sounds = Object.fromEntries(entries);

    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/music.wav'),
      { isLooping: true, volume: 0.35 }
    );
    music = sound;
  } catch (e) {
    // Audio unavailable — game still playable without sound
  }
}

export function setSfxEnabled(val) { sfxEnabled = val; }
export function setMusicEnabled(val) { musicEnabled = val; }

export async function playSound(name) {
  if (!sfxEnabled) return;
  const sound = sounds[name];
  if (!sound) return;
  try {
    await sound.replayAsync();
  } catch {}
}

export async function startMusic() {
  if (!musicEnabled || !music) return;
  try {
    const status = await music.getStatusAsync();
    if (!status.isPlaying) await music.playAsync();
  } catch {}
}

export async function stopMusic() {
  if (!music) return;
  try {
    await music.stopAsync();
    await music.setPositionAsync(0);
  } catch {}
}
