import { Platform, StatusBar } from 'react-native';

// With edgeToEdgeEnabled: true on Android, the app draws behind the status bar.
// React Native's SafeAreaView doesn't compensate for this, so screens need explicit top padding.
export const ANDROID_TOP = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;
