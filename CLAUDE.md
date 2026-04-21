# Tappy Word — Project Handoff

## What this is
A mobile word-synonym puzzle game for iOS and Android built with **Expo (React Native)**. The player is shown a target word and must tap all its synonyms floating around the screen before the timer runs out. Finding all synonyms advances to the next round; failing ends the game and shows a total score.

## Running the project
```
cd ~/Documents/repos/tappy-word
npx expo start --clear
```
- Test on device via **Expo Go** app (App Store / Google Play)
- Phone and Mac must be on the same network, or use iPhone as hotspot if there are connection issues
- Scan the QR code in Expo Go to load the app

## GitHub
https://github.com/Samsimus12/tappy-word

## Tech stack
- **Expo SDK 54** with New Architecture enabled (`newArchEnabled: true`)
- **React Native** built-in `Animated` API for floating word animations (NOT Reanimated — it caused "Exception in HostFunction" errors with this Expo config)
- **expo-av** for all audio (sound effects + background music)
- **Datamuse API** (`api.datamuse.com`) for synonym fetching — 6s timeout with AbortController
- **AsyncStorage** for hints and settings persistence
- No navigation library — simple screen state machine in `App.js`

## File structure
```
App.js                          # Screen state machine (home → game → round-complete → results)
screens/
  HomeScreen.js                 # Title, rules, difficulty picker, SFX/Music toggles
  GameScreen.js                 # Main game: floating words, timer, score, sound triggers
  RoundCompleteScreen.js        # Between rounds: round score + total + found synonyms + continue
  ResultsScreen.js              # End screen: total score, missed synonyms, play again
components/
  FloatingWord.js               # Animated floating word bubble (built-in Animated API)
constants/
  difficulty.js                 # Easy/Medium/Hard configs (duration, synonyms, distractors, speed, wrongPenalty)
  wordList.js                   # BASE_WORDS (target words) and DISTRACTOR_WORDS pool
  fallbackSynonyms.js           # Offline fallback synonym map for all BASE_WORDS
utils/
  datamuse.js                   # fetchSynonyms() and fetchRelatedWords() with frequency filter
  wordPool.js                   # buildWordPool() — seeds ~1000-word pool from Datamuse on startup
  wordQueue.js                  # Shuffle queue: initQueue(words) + nextWord() — no-repeat word selection
  hintStorage.js                # AsyncStorage wrapper for hint count (initializes to 10)
  settingsStorage.js            # AsyncStorage wrapper for { sfxEnabled, musicEnabled }
  audio.js                      # expo-av audio manager: initAudio(), playSound(name), startMusic(), stopMusic()
assets/
  sounds/                       # WAV sound effects and music (synthesized — replace with better assets)
    correct.wav                 # Rising happy ding — played on correct synonym tap
    wrong.wav                   # Descending sad thud — played on wrong tap
    success.wav                 # Fanfare arpeggio — played when all synonyms found
    fail.wav                    # Descending notes — played when timer hits 0
    tick.wav                    # Short click — played on each countdown number (3, 2, 1)
    hint.wav                    # Sparkle arpeggio — played when hint is used
    music.wav                   # Looping background melody — plays during gameplay
scripts/
  generate-sounds.js            # Node script that regenerates all WAV files in assets/sounds/
```

## Game flow
1. **HomeScreen** — pick difficulty, tap Play or Survival Mode
2. **GameScreen** — countdown 3-2-1-Go!, floating word bubbles, timer, score popups
3. **RoundCompleteScreen** — found all synonyms: shows round score + running total + synonyms found, Continue
4. **GameScreen** (next round) — repeats until timer runs out
5. **ResultsScreen** — time ran out: shows total score, last word stats, missed synonyms, Play Again (→ HomeScreen)

**Survival Mode** — single continuous session: starts with 60s, +25s per word solved, -2s per wrong tap

## Difficulty levels
| | Easy | Medium | Hard |
|---|---|---|---|
| Timer | 45s | 30s | 20s |
| Synonyms | 4 | 6 | 8 |
| Distractors | 8 | 12 | 16 |
| Word speed | 0.6× | 1.0× | 1.6× |
| Wrong penalty | -2 pts | -5 pts | -8 pts |

## Scoring
- +10 per correct synonym tapped
- -2/-5/-8 per wrong tap depending on difficulty (minimum 0 per round)
- Score accumulates across rounds, shown live in the game header
- Score popups (+10 green / -N red) float up from the bottom of the screen on each tap

## Hints
- Players start with 10 hints, persisted via AsyncStorage across sessions
- Hint button shown in game header; tapping highlights a random unfound synonym for 2 seconds
- Hints are a stub for future ad integration (earn hints by watching ads)

## Audio
All sounds use `expo-av` loaded via `utils/audio.js` (`initAudio()` called on app startup).

**Sound events:**
| Event | Sound |
|---|---|
| Correct tap | `correct.wav` |
| Wrong tap | `wrong.wav` |
| All synonyms found | `success.wav` |
| Timer hits 0 | `fail.wav` |
| Countdown 3/2/1 | `tick.wav` |
| Hint used | `hint.wav` |
| Game active | `music.wav` (looping) |

Music starts when GameScreen mounts, stops on game end (both win/lose paths).
SFX and Music are independently toggleable from HomeScreen, persisted via AsyncStorage.

**Known issue — audio quality:** Current WAV files are simple synthesized tones generated by `scripts/generate-sounds.js`. They are functional but low quality. **Next step: replace with real audio assets.** Good free sources:
- **Kenney.nl** (kenney.nl/assets) — CC0 game audio packs (UI sounds, jingles)
- **freesound.org** — CC0/CC-BY sounds
- **OpenGameArt.org** — free game music loops
  
Drop replacement files into `assets/sounds/` with the same filenames — no code changes needed. MP3 files work fine with expo-av (rename the `require()` paths in `utils/audio.js` if you change extensions).

## Known issues / things to revisit
- Datamuse occasionally returns 0 synonyms for some words — fallback dictionary covers all BASE_WORDS
- No persistent high score storage yet (AsyncStorage would be straightforward to add)
- No haptics yet (expo-haptics would pair well with the correct/wrong tap sounds)
- App icon and splash screen are still Expo defaults
- Audio assets are placeholder synthesized tones — replace with real sounds (see Audio section above)
