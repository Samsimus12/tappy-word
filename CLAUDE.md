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
- **Datamuse API** (`api.datamuse.com`) for synonym fetching — 6s timeout with AbortController
- No navigation library — simple screen state machine in `App.js`

## File structure
```
App.js                          # Screen state machine (home → game → round-complete → results)
screens/
  HomeScreen.js                 # Title, rules, difficulty picker
  GameScreen.js                 # Main game: floating words, timer, score
  RoundCompleteScreen.js        # Between rounds: round score + total + continue button
  ResultsScreen.js              # End screen: total score, missed synonyms, play again
components/
  FloatingWord.js               # Animated floating word bubble (built-in Animated API)
constants/
  difficulty.js                 # Easy/Medium/Hard configs (duration, synonyms, distractors, speed)
  wordList.js                   # BASE_WORDS (target words) and DISTRACTOR_WORDS pool
  fallbackSynonyms.js           # Offline fallback synonym map for all BASE_WORDS
utils/
  datamuse.js                   # fetchSynonyms() with 6s timeout
```

## Game flow
1. **HomeScreen** — pick difficulty, tap Play
2. **GameScreen** — 20/30/45s timer, floating word bubbles, tap synonyms to score
3. **RoundCompleteScreen** — found all synonyms: shows round score + running total, Continue button
4. **GameScreen** (next round, same difficulty) — repeats until timer runs out
5. **ResultsScreen** — time ran out: shows total score, last word stats, missed synonyms, Play Again (→ HomeScreen)

## Difficulty levels
| | Easy | Medium | Hard |
|---|---|---|---|
| Timer | 45s | 30s | 20s |
| Synonyms | 4 | 6 | 8 |
| Distractors | 8 | 12 | 16 |
| Word speed | 0.6× | 1.0× | 1.6× |

## Scoring
- +10 per correct synonym tapped
- -2 per wrong tap (minimum 0 per round)
- Score accumulates across rounds and is shown live in the game header

## Known issues / things to revisit
- Datamuse occasionally returns 0 synonyms for some words — the fallback dictionary covers all BASE_WORDS but live API results vary
- No persistent high score storage yet (AsyncStorage would be the next step)
- No sound effects or haptics yet
- App icon and splash screen are still the Expo defaults
