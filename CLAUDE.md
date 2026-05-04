# Tappy Word Burst (formerly Word Sweep / Tappy Word / Synonym Bun) — Project Handoff

## What this is
A mobile word-synonym puzzle game for iOS and Android built with **Expo (React Native)**. The player is shown a target word and must tap all its synonyms floating around the screen before the timer runs out. Finding all synonyms advances to the next round; failing ends the game and shows a total score.

## Running the project
```bash
cd ~/Documents/repos/tappy-word-burst
npx expo start --clear
```
- **Expo Go no longer works** — `react-native-google-mobile-ads` is a native module requiring a custom dev client
- Use `npx expo run:ios` for local device/simulator testing
- Use `npx expo run:android` for Android emulator (requires Android Studio AVD + Java 17 + ANDROID_HOME set)

**Simulator commands for App Store screenshots:**
```bash
npx expo run:ios --device "iPhone 17 Pro Max"     # 6.9" — required
npx expo run:ios --device "iPad Pro 13-inch (M5)"  # 13" — required (supportsTablet: true)
```
Note: flag is `--device`, not `--simulator`. Xcode only has iPhone 17 models — no iPhone 16.
Take screenshots with `Cmd+S` in Simulator, or `xcrun simctl io booted screenshot screenshot.png`.

**Android prerequisites** (one-time setup):
- Java 17: `brew install --cask zulu@17` + `export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home`
- `export ANDROID_HOME=$HOME/Library/Android/sdk` + add `$ANDROID_HOME/emulator` and `$ANDROID_HOME/platform-tools` to PATH
- Create an AVD in Android Studio → Virtual Device Manager before running

## GitHub
https://github.com/Samsimus12/tappy-word-burst

## App identity
- **Display name**: Tappy Word Burst
- **Bundle ID / Android package**: `com.sammorrison.tappyword` (note: NOT tappywordburst)
- **Slug**: `tappy-word-burst`
- **EAS project ID**: `5079b3ac-0adf-4824-868e-1f48247c525c`
- **App Store Connect app ID**: `6764457991` (pinned in `eas.json` as `ascAppId`)
- **Android versionCode**: managed remotely by EAS (`appVersionSource: "remote"`, `autoIncrement: true`)
- **AdMob publisher**: `ca-app-pub-7289760521218684`

## Tech stack
- **Expo SDK 54** with New Architecture enabled (`newArchEnabled: true`)
- **React Native** built-in `Animated` API (NOT Reanimated — causes "Exception in HostFunction" crashes with this Expo config)
- **expo-av** for all audio (sound effects + background music)
- **react-native-google-mobile-ads** for AdMob (rewarded + interstitial ads)
- **Datamuse API** (`api.datamuse.com`) for synonym fetching — 6s timeout with AbortController
- **AsyncStorage** for hints, settings, and achievement persistence
- No navigation library — simple screen state machine in `App.js`

## File structure
```
App.js                          # Screen state machine + all ad/hint/round state
screens/
  HomeScreen.js                 # Difficulty picker, mode selector card, settings modal, achievements link
  GameScreen.js                 # Main game: floating/falling words, timer, ads, second chance modal
  RoundCompleteScreen.js        # Between rounds: scores, synonyms found, Watch Ad for hints
  ResultsScreen.js              # End screen: total score, missed synonyms, play again / back to home
  AchievementsScreen.js         # Achievement grid + theme selector
  LoadingScreen.js              # Animated splash shown while word pool builds on startup
components/
  FloatingWord.js               # Animated floating word bubble — accepts bubbleColor prop
  FallingWord.js                # Falling word bubble for Falling Words mode — accepts bubbleColor prop
constants/
  difficulty.js                 # Easy/Medium/Hard configs (duration, synonyms, distractors, speed, correctPoints, wrongPenalty)
  wordList.js                   # BASE_WORDS (156 target words) and DISTRACTOR_WORDS (321 words)
  fallbackSynonyms.js           # Offline fallback synonym map for original BASE_WORDS
  achievements.js               # THEMES object (8 themes) + ACHIEVEMENTS array (10 achievements)
utils/
  datamuse.js                   # fetchSynonyms() and fetchRelatedWords() with frequency filter
  wordPool.js                   # buildWordPool() — seeds ~1000-word pool from Datamuse on startup
  wordQueue.js                  # Shuffle queue: initQueue(words) + nextWord() — no-repeat word selection
  hintStorage.js                # AsyncStorage wrapper for hint count (initializes to 10)
  settingsStorage.js            # AsyncStorage wrapper for { sfxEnabled, musicEnabled }
  achievementStorage.js         # AsyncStorage wrapper for { unlockedIds, selectedTheme, modesPlayed }
  audio.js                      # expo-av audio manager: initAudio(), playSound(name), startMusic(), stopMusic(), pauseMusic(), resumeMusic()
  admob.js                      # AdMob wrapper: showRewardedAd(), preloadInterstitial(), showInterstitial()
  androidSafeTop.js             # ANDROID_TOP constant: StatusBar.currentHeight on Android, 0 on iOS
assets/
  icon.png                      # 1024×1024 RGB — slightly blurry (upscaled); better version planned
  splash-icon.png               # 688×1504 RGB — bg #0062ff (blue)
  sounds/                       # WAV sound effects (Success, Fail, Hint, Countdown, Go) — all capitalized
  music/                        # Menu.wav (home loop) + 4 game tracks (randomly selected per round)
```

## Game flow
1. **HomeScreen** — pick difficulty + mode, tap Play
2. **GameScreen** — countdown 3-2-1-Go!, word bubbles, timer, round score popups
3. **RoundCompleteScreen** — found all synonyms: round score + running total + synonyms found, Continue
4. **GameScreen** (next round) — repeats until timer runs out
5. **ResultsScreen** — time ran out: total score, last word stats, missed synonyms, Play Again / Back to Home

**Survival Mode** — continuous session: starts at 30s, +25s per word solved, -5s per wrong tap

**Falling Words Mode** — synonyms fall top-to-bottom and recycle if missed; same timer/scoring as Standard

## Difficulty levels
| | Easy | Medium | Hard |
|---|---|---|---|
| Timer | 45s | 30s | 20s |
| Synonyms shown | 4 | 6 | 8 |
| Distractors | 8 | 12 | 16 |
| Word speed | 0.6× | 1.0× | 1.6× |
| Correct points | +5 | +10 | +15 |
| Wrong penalty | -2 | -5 | -8 |
| Synonym count | shown | shown | hidden |

Hard mode shows "X found" instead of "X / Y found". HomeScreen mode selector card border, arrows, label, dots, and Play button all use `diff.color` to reflect active difficulty.

## Scoring
- Points per correct tap scale by difficulty (+5/+10/+15), stored in `difficulty.js` as `correctPoints`
- Wrong taps penalize -2/-5/-8 (minimum 0 per round)
- **In-game header shows round score only** (resets each round)
- Total accumulated score shown on RoundCompleteScreen and ResultsScreen

## AdMob integration (fully implemented)
All ad unit IDs are platform-specific via `Platform.OS` in `utils/admob.js`.

| | iOS | Android |
|---|---|---|
| App ID | `~1657536521` | `~9372375010` |
| Rewarded | `/5772041359` | `/4168464429` |
| Interstitial | `/6650234092` | `/4559346663` |

**Music always pauses before any ad and resumes after** via `pauseMusic()`/`resumeMusic()`. `resumeMusic()` is a no-op if music is disabled.

**1. Rewarded — Hint reward** (GameScreen + RoundCompleteScreen): hint button shows "Watch Ad (+3)" when hints = 0; timer freezes during ad (`adLoading` in timer useEffect deps); grants 3 hints on success.

**2. Rewarded — Second Chance** (GameScreen): when timer hits 0 and second chance not yet used, shows modal to watch ad for +15s. One per game — `secondChanceUsedRef` in `App.js` resets on Back/Play Again.

**3. Interstitial — Between rounds** (App.js `handleContinue`): shows randomly every 3–6 rounds; skipped if rewarded ad watched that round (`watchedRewardedAdRef`).

**Dev mode**: all ads use `TestIds.REWARDED` / `TestIds.INTERSTITIAL` automatically via `__DEV__`

## Hints
- Players start with 10 hints, persisted via AsyncStorage
- Tapping highlights a random unfound synonym for 2 seconds
- Long-press hint button resets to 10 (dev tool only)
- Earned via rewarded ads (+3 per ad) from GameScreen or RoundCompleteScreen

## Audio
`initAudio()` called on app startup. Uses `Promise.allSettled` so one bad file doesn't kill all audio. SFX uses `setPositionAsync(0)` + `playAsync()` (not `replayAsync()`) for reliability. Game music randomly picks from 4 tracks; `gameMusicActive` flag prevents restarts between rounds. `pauseMusic()`/`resumeMusic()` pause and resume without unloading. Simulator audio is unreliable — test music on a physical device.

## Key technical notes

### Animation & touch (critical)
- **Use `Animated`, NOT Reanimated** — Reanimated causes "Exception in HostFunction" crashes with this Expo config
- **FloatingWord / FallingWord position animations use `useNativeDriver: false`** — this is intentional. Native driver moves the visual but NOT the touch hitbox on Android, making bubbles untappable. JS driver is slightly less smooth but correct. Tap-feedback animations (scale, opacity, shake) still use `useNativeDriver: true`.
- **Touch handled via responder API on the outer `Animated.View`** (`onStartShouldSetResponder` + `onResponderRelease`) — NOT a nested `Pressable`. Pressable inside animated views compounds the hitbox problem on Android.
- **FloatingWord uses recursive animation** (not `Animated.loop`) — each move picks a new target using `boundsRef.current` and `bubbleSizeRef.current` (actual layout size from `onLayout`) to keep bubbles in-bounds. `Animated.loop` with fixed targets caused position snaps and off-screen drift.
- **GameScreen passes real `wordAreaBounds`** (measured via `onLayout` on the wordArea View) as `bounds` to FloatingWord and `screenWidth/Height` to FallingWord — NOT hardcoded from `Dimensions`. This accounts for safe area insets that make the rendered area smaller than `Dimensions.get('window')`.

### Android edge-to-edge
- `app.json` has `"edgeToEdgeEnabled": true` for Android, which draws the app behind the status bar
- React Native's built-in `SafeAreaView` does NOT compensate for this on Android
- All screens import `ANDROID_TOP` from `utils/androidSafeTop.js` and apply it as `paddingTop` on their container style
- `ANDROID_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0`

### Other gotchas
- **FallingWord recycling**: handled internally via `tappedRef` to sync animation callbacks with React state
- **fallbackSynonyms.js** only covers the original ~58 BASE_WORDS — the 98 newer BASE_WORDS rely on Datamuse
- **ScrollView centering**: RoundCompleteScreen uses `flexGrow: 1` on `contentContainerStyle` so `justifyContent: 'center'` works
- **Sound file casing**: All files in `assets/sounds/` use capitalized names (Success.wav, Fail.wav, Hint.wav) — must match exactly or EAS build fails on Linux

## Deploying

### iOS
```bash
eas build --platform ios --profile production
eas submit --platform ios --latest
```
- **v2.0.1 is live on App Store** (submitted 2026-04-30)
- `eas.json` `submit.production.ios.ascAppId` = `"6764457991"`

### Android
```bash
eas build --platform android --profile production
eas submit --platform android --latest
```
- **Google Play internal testing track is active** — builds go live to testers within ~2 hours
- Google service account key is already configured in EAS — `eas submit` works without extra setup
- Testers must opt in once via the internal testing link in Play Console; after that, updates are automatic
- **app-ads.txt** hosted at `https://samsimus12.github.io/app-ads.txt`

## Still needed
- Replace `assets/icon.png` with a sharper version (current is slightly blurry — upscaled from low-res source)
- Update Support URL and Marketing URL in App Store Connect to `https://samsimus12.github.io` — can only be changed when submitting a new version
- Animation smoothness on Android: `useNativeDriver: false` for position animations may look choppy on low-end devices. If it's a problem on real hardware (not just emulator), consider a parent-level touch handler in GameScreen that tracks positions via `addListener` and restores native driver.

## Ideas / future features
- **Rocket power-up**: destroys all remaining synonym bubbles at once. Earned ~1 per 1000 points scored — rare, satisfying, not purchasable.
- No persistent high score yet (AsyncStorage addition would be straightforward)
- No haptics yet (`expo-haptics` would pair well with tap sounds)
- Datamuse occasionally returns 0 synonyms — fallback covers original BASE_WORDS only
