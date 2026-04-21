# Tappy Word — Project Handoff

## What this is
A mobile word-synonym puzzle game for iOS and Android built with **Expo (React Native)**. The player is shown a target word and must tap all its synonyms floating around the screen before the timer runs out. Finding all synonyms advances to the next round; failing ends the game and shows a total score.

## Running the project
```
cd ~/Documents/repos/tappy-word
npx expo start --clear
```
- Test on device via **Expo Go** app (App Store / Google Play)
- Same network required, OR use `npx expo start --tunnel` to demo anywhere without being on the same network
- Scan the QR code in Expo Go to load the app

## GitHub
https://github.com/Samsimus12/tappy-word

## Tech stack
- **Expo SDK 54** with New Architecture enabled (`newArchEnabled: true`)
- **React Native** built-in `Animated` API for floating word animations (NOT Reanimated — it caused "Exception in HostFunction" errors with this Expo config)
- **expo-av** for all audio (sound effects + background music)
- **Datamuse API** (`api.datamuse.com`) for synonym fetching — 6s timeout with AbortController
- **AsyncStorage** for hints, settings, and achievement persistence
- No navigation library — simple screen state machine in `App.js`

## File structure
```
App.js                          # Screen state machine (home → game → round-complete → results → achievements)
screens/
  HomeScreen.js                 # Title, difficulty picker, 3 game modes, ⚙️ settings modal, 🏆 achievements link
  GameScreen.js                 # Main game: floating/falling words, timer, score, sound triggers
  RoundCompleteScreen.js        # Between rounds: round score + total + found synonyms + continue
  ResultsScreen.js              # End screen: total score, missed synonyms, play again / back to home
  AchievementsScreen.js         # Achievement grid + theme selector
components/
  FloatingWord.js               # Animated floating word bubble (built-in Animated API) — accepts bubbleColor prop
  FallingWord.js                # Falling word bubble for Falling Words mode — accepts bubbleColor prop
constants/
  difficulty.js                 # Easy/Medium/Hard configs (duration, synonyms, distractors, speed, wrongPenalty)
  wordList.js                   # BASE_WORDS (target words) and DISTRACTOR_WORDS pool
  fallbackSynonyms.js           # Offline fallback synonym map for all BASE_WORDS
  achievements.js               # THEMES object (8 themes) + ACHIEVEMENTS array (10 achievements)
utils/
  datamuse.js                   # fetchSynonyms() and fetchRelatedWords() with frequency filter
  wordPool.js                   # buildWordPool() — seeds ~1000-word pool from Datamuse on startup
  wordQueue.js                  # Shuffle queue: initQueue(words) + nextWord() — no-repeat word selection
  hintStorage.js                # AsyncStorage wrapper for hint count (initializes to 10)
  settingsStorage.js            # AsyncStorage wrapper for { sfxEnabled, musicEnabled }
  achievementStorage.js         # AsyncStorage wrapper for { unlockedIds, selectedTheme, modesPlayed }
  audio.js                      # expo-av audio manager: initAudio(), playSound(name), startMusic(), stopMusic()
assets/
  sounds/                       # Real WAV sound effects
    Success.wav                 # Played on correct synonym tap + all synonyms found
    Fail.wav                    # Played on wrong tap + timer hits 0
    Hint.wav                    # Played when hint is used
    Countdown.wav               # Played for each countdown number (3, 2, 1)
    Go.wav                      # Played when "Go!" appears
  music/                        # Background music tracks (WAV)
    Menu.wav                    # Loops on home screen
    Pocket Parade.wav           # Game music track 1 (randomly selected, auto-advances)
    Tile Tap Loop.wav           # Game music track 2
    Taploop Arcade.wav          # Game music track 3
scripts/
  generate-sounds.js            # Node script that regenerates placeholder WAV files (legacy)
```

## Game flow
1. **HomeScreen** — pick difficulty, tap Play / Survival Mode / Falling Words
2. **GameScreen** — countdown 3-2-1-Go!, word bubbles, timer, score popups
3. **RoundCompleteScreen** — found all synonyms: round score + running total + synonyms found, Continue
4. **GameScreen** (next round) — repeats until timer runs out
5. **ResultsScreen** — time ran out: total score, last word stats, missed synonyms, Play Again / Back to Home

**Survival Mode** — single continuous session: starts with 30s, +25s per word solved, -5s per wrong tap

**Falling Words Mode** — synonyms fall top-to-bottom and recycle if missed; same timer/scoring as normal

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
- Long-press hint button resets hint count to 10 (dev convenience)
- Hints are a stub for future ad integration (earn hints by watching ads)

## Audio
All sounds use `expo-av` loaded via `utils/audio.js` (`initAudio()` called on app startup).

**Sound events:**
| Event | Sound |
|---|---|
| Correct tap | `Success.wav` |
| Wrong tap | `Fail.wav` |
| All synonyms found | `Success.wav` |
| Timer hits 0 | `Fail.wav` |
| Countdown 3/2/1 | `Countdown.wav` |
| Hint used | `Hint.wav` |
| "Go!" | `Go.wav` |
| Menu screen | `Menu.wav` (looping) |
| Game active | Random track from `music/` (auto-advances when track ends) |

Music system uses a `gameMusicActive` flag so music plays seamlessly between rounds without restarting.
SFX and Music are independently toggleable from the ⚙️ settings modal on HomeScreen, persisted via AsyncStorage.

## Achievements & Themes

Defined in `constants/achievements.js`. State managed in `App.js`, persisted via `utils/achievementStorage.js`.

**8 Themes** (each changes bg, header, card, and word bubble colors):
| Theme | Unlocked by |
|---|---|
| Cosmic (default) | Always unlocked |
| Midnight | Clean Sweep achievement |
| Forest | High Scorer (500 pts) |
| Crimson | Hard Hero achievement |
| Ocean | Explorer achievement |
| Gold | Word Master (1000 pts) |
| Neon | Survivor (5 survival words) |
| Rose | On a Roll (round 5) |

**10 Achievements:**
| ID | Condition |
|---|---|
| `first_game` | Play any game |
| `clean_sweep` | Finish a round with 0 wrong taps |
| `speed_demon` | Complete a round with 15s+ remaining |
| `hard_hero` | Complete a Hard difficulty round |
| `explorer` | Play all 3 game modes |
| `survival_5` | Solve 5 words in Survival Mode |
| `survival_10` | Solve 10 words in Survival Mode |
| `score_500` | Reach 500 total score |
| `score_1000` | Reach 1000 total score |
| `round_5` | Reach round 5 in Normal Mode |

Achievement checking runs in `App.js` → `checkAndGrantAchievements()` after every game end. Newly unlocked achievements appear as a banner on ResultsScreen and RoundCompleteScreen.

Theme is threaded through all screens via a `theme` prop. Word bubbles receive `theme.bubble` as a `bubbleColor` prop.

## HomeScreen layout
- Top bar: 🏆 (opens AchievementsScreen) | ⚙️ (opens settings modal)
- Settings modal: SFX and Music toggles with ON/OFF pills, themed accent color
- Main content: title, difficulty picker, Play / Survival / Falling Words buttons
- Animated floating background words (40 words drifting with recursive animation)

## Key technical notes
- **Animated API**: Use React Native's built-in `Animated`, NOT Reanimated (causes crashes with this Expo config)
- **Recursive animation pattern**: FloatingBackground uses recursive `Animated.timing` callbacks, NOT `Animated.loop` — loop caused visible position snaps
- **Music between rounds**: `gameMusicActive` flag in `audio.js` prevents restarts. `startMusic()` is a no-op if already active
- **Screen state bug (fixed)**: `const [screen, setScreen]` MUST be declared before any `useEffect` that references it in its dependency array — Babel hoists `const` as `var undefined` otherwise
- **Audio loading**: Uses `Promise.allSettled` (not `Promise.all`) so one bad file doesn't kill all SFX
- **SFX playback**: Uses `setPositionAsync(0)` + `playAsync()` instead of `replayAsync()` for reliability
- **FallingWord recycling**: Handled internally by the component — parent doesn't need to know about missed words. Uses `tappedRef` to sync animation callbacks with React state
- **Achievement timeLeft**: `buildResult()` in GameScreen accepts a `tl` param for time remaining, used by `speed_demon` check

## Known issues / things to revisit
- Datamuse occasionally returns 0 synonyms for some words — fallback dictionary covers all BASE_WORDS
- No persistent high score storage yet (AsyncStorage would be straightforward to add)
- No haptics yet (expo-haptics would pair well with correct/wrong tap sounds)
- App icon and splash screen are still Expo defaults
- To distribute without App Store: use `npx expo start --tunnel` for demos, or EAS Build + TestFlight for standalone install
