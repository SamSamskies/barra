import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

const FEATURES = [
  { icon: 'map-outline' as const, text: 'Structured skill-tree progression' },
  { icon: 'flash-outline' as const, text: 'Structured lessons with clear milestones' },
  { icon: 'trophy-outline' as const, text: '7 milestones to the muscle-up' },
];

function getStartingPoint(pullUps: number): { label: string; skipped: number } {
  if (pullUps <= 0)  return { label: 'Foundation — Ground Zero', skipped: 0 };
  if (pullUps <= 2)  return { label: 'Foundation — First Rep', skipped: 1 };
  if (pullUps <= 3)  return { label: 'Foundation — Building Reps', skipped: 2 };
  if (pullUps <= 4)  return { label: 'Foundation — Steady Climb', skipped: 3 };
  if (pullUps <= 5)  return { label: 'Foundation — Finding Volume', skipped: 4 };
  if (pullUps <= 6)  return { label: 'Foundation — Strong Sets', skipped: 5 };
  if (pullUps <= 8)  return { label: 'Foundation — Strength Surge', skipped: 6 };
  if (pullUps <= 10) return { label: 'Foundation — Power Seven', skipped: 7 };
  if (pullUps <= 12) return { label: 'Foundation — Max Strength', skipped: 8 };
  return { label: 'Strength Base — Scapular Power', skipped: 9 };
}

export default function Onboarding() {
  const colors = useColors();
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [pullUps, setPullUps] = useState(10);

  const decrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPullUps(prev => Math.max(0, prev - 1));
  };

  const increment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPullUps(prev => Math.min(50, prev + 1));
  };

  const handleBegin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await completeOnboarding(pullUps);
    router.replace('/(tabs)');
  };

  const topPad = Platform.OS === 'web' ? 67 : 0;

  if (step === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={[styles.safe, { paddingTop: topPad }]}>
          <View style={styles.content}>
            {/* Hero */}
            <View style={[styles.hero, { backgroundColor: colors.card }]}>
              <Ionicons name="barbell-outline" size={72} color={colors.primary} />
            </View>

            <View style={styles.headingBlock}>
              <Text style={[styles.heading, { color: colors.foreground }]}>
                Your path to the{'\n'}
                <Text style={{ color: colors.primary }}>Muscle-up</Text>
              </Text>
              <Text style={[styles.sub, { color: colors.mutedForeground }]}>
                A structured calisthenics system. Train at your own pace, hit skill milestones, and make real progress toward your goal.
              </Text>
            </View>

            <View style={styles.features}>
              {FEATURES.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <View style={[styles.featureIcon, { backgroundColor: colors.card }]}>
                    <Ionicons name={f.icon} size={20} color={colors.primary} />
                  </View>
                  <Text style={[styles.featureText, { color: colors.foreground }]}>
                    {f.text}
                  </Text>
                </View>
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setStep(1);
              }}
            >
              <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>
                Get Started
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={[styles.safe, { paddingTop: topPad }]}>
        <View style={styles.content}>
          <Pressable onPress={() => setStep(0)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>

          <Text style={[styles.heading, { color: colors.foreground, textAlign: 'center' }]}>
            How many{'\n'}
            <Text style={{ color: colors.primary }}>pull-ups</Text> can you do?
          </Text>
          <Text style={[styles.sub, { color: colors.mutedForeground, textAlign: 'center' }]}>
            We'll skip lessons you've already mastered and start you at the right place.
          </Text>

          {/* Stepper */}
          <View style={styles.stepper}>
            <Pressable
              onPress={decrement}
              style={[styles.stepBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Ionicons name="remove" size={28} color={colors.foreground} />
            </Pressable>

            <View style={styles.countBox}>
              <Text style={[styles.countNum, { color: colors.foreground }]}>{pullUps}</Text>
              <Text style={[styles.countLabel, { color: colors.mutedForeground }]}>reps</Text>
            </View>

            <Pressable
              onPress={increment}
              style={[styles.stepBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Ionicons name="add" size={28} color={colors.foreground} />
            </Pressable>
          </View>

          {/* Placement preview */}
          {(() => {
            const { label, skipped } = getStartingPoint(pullUps);
            return (
              <View style={[styles.placementCard, { backgroundColor: colors.card, borderColor: colors.accent + '55' }]}>
                <Ionicons name="pin-outline" size={20} color={colors.accent} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[styles.placementText, { color: colors.foreground }]}>
                    Starting at: {label}
                  </Text>
                  {skipped > 0 && (
                    <Text style={[styles.placementSub, { color: colors.mutedForeground }]}>
                      {skipped} earlier {skipped === 1 ? 'lesson' : 'lessons'} skipped — you've got this covered
                    </Text>
                  )}
                </View>
              </View>
            );
          })()}

          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleBegin}
          >
            <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>
              Begin Journey
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 24,
    justifyContent: 'center',
    gap: 28,
  },
  hero: {
    alignSelf: 'center',
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingBlock: { gap: 12 },
  heading: {
    fontSize: 34,
    fontFamily: 'Inter_700Bold',
    lineHeight: 42,
  },
  sub: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
  },
  features: { gap: 16 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  primaryBtn: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
  },
  backBtn: {
    alignSelf: 'flex-start',
    padding: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  stepBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBox: {
    alignItems: 'center',
    minWidth: 110,
  },
  countNum: {
    fontSize: 64,
    fontFamily: 'Inter_700Bold',
    lineHeight: 72,
  },
  countLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    marginTop: -6,
  },
  placementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  placementText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  placementSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
});
