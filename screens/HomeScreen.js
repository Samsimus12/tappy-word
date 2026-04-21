import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { DIFFICULTY } from '../constants/difficulty';

export default function HomeScreen({ onPlay }) {
  const [selected, setSelected] = useState('medium');
  const diff = DIFFICULTY[selected];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Tappy{'\n'}Word</Text>
        <Text style={styles.subtitle}>How many synonyms can you find?</Text>

        <View style={styles.rulesBox}>
          <Rule emoji="🎯" text="A target word appears at the top" />
          <Rule emoji="👆" text="Tap every synonym floating on screen" />
          <Rule emoji="✅" text="+10 points for each correct synonym" />
          <Rule emoji="❌" text="-2 points for wrong taps" />
          <Rule emoji="⏱️" text="Find them all to advance to the next round" />
        </View>

        <Text style={styles.diffLabel}>Difficulty</Text>
        <View style={styles.diffRow}>
          {Object.entries(DIFFICULTY).map(([key, d]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.diffBtn,
                { borderColor: d.color },
                selected === key && { backgroundColor: d.color },
              ]}
              onPress={() => setSelected(key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.diffBtnText, selected === key && styles.diffBtnTextActive]}>
                {d.label}
              </Text>
              <Text style={[styles.diffBtnSub, selected === key && styles.diffBtnTextActive]}>
                {d.duration}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.playBtn, { backgroundColor: diff.color, shadowColor: diff.color }]}
          onPress={() => onPlay(selected, 'normal')}
          activeOpacity={0.85}
        >
          <Text style={styles.playBtnText}>Play</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.survivalBtn}
          onPress={() => onPlay(selected, 'survival')}
          activeOpacity={0.85}
        >
          <Text style={styles.survivalBtnTitle}>⚡ Survival Mode</Text>
          <Text style={styles.survivalBtnSub}>Solve words to add time · wrong taps cost 2s</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Rule({ emoji, text }) {
  return (
    <View style={styles.ruleRow}>
      <Text style={styles.ruleEmoji}>{emoji}</Text>
      <Text style={styles.ruleText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f2e',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 48,
    paddingBottom: 40,
  },
  title: {
    fontSize: 52,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
    lineHeight: 58,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#a5b4fc',
    textAlign: 'center',
    marginBottom: 36,
  },
  rulesBox: {
    width: '100%',
    backgroundColor: '#1e1e4a',
    borderRadius: 18,
    padding: 20,
    marginBottom: 28,
    gap: 14,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ruleEmoji: {
    fontSize: 20,
    width: 26,
    textAlign: 'center',
  },
  ruleText: {
    color: '#e0e7ff',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  diffLabel: {
    color: '#a5b4fc',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  diffRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  diffBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  diffBtnText: {
    color: '#e0e7ff',
    fontSize: 15,
    fontWeight: '700',
  },
  diffBtnSub: {
    color: '#a5b4fc',
    fontSize: 11,
    marginTop: 2,
  },
  diffBtnTextActive: {
    color: '#fff',
  },
  playBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 10,
  },
  playBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2d2d6e',
  },
  dividerText: {
    color: '#4b4b70',
    fontSize: 13,
    fontWeight: '600',
  },
  survivalBtn: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: '#1e1e4a',
    borderWidth: 2,
    borderColor: '#f43f5e',
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  survivalBtnTitle: {
    color: '#f43f5e',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  survivalBtnSub: {
    color: '#a5b4fc',
    fontSize: 12,
    marginTop: 4,
  },
});
