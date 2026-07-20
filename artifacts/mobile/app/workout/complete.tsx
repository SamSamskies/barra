import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { getCurrentLevel } from '@/constants/track';

export default function CompleteScreen() {
  const { lessonTitle, skippedSets: skippedParam } = useLocalSearchParams<{ lessonTitle: string; skippedSets: string }>();
  const colors = useColors();
  const { state } = useApp();

  const skippedSets = parseInt(skippedParam ?? '0', 10);
  const hadSkips = skippedSets > 0;
  const { level } = getCurrentLevel(state.completedLessonIds);

  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(statsOpacity, {
        toValue: 1,
        duration: 400,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const webTopPad = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={[styles.safe, { paddingTop: webTopPad }]}>
        <Animated.View style={[styles.content, { opacity }]}>
          {/* Trophy */}
          <Animated.View
            style={[
              styles.trophyRing,
              {
                backgroundColor: colors.card,
                borderColor: colors.accent + '55',
                transform: [{ scale }],
              },
            ]}
          >
            <Ionicons name="trophy" size={64} color={colors.accent} />
          </Animated.View>

          <View style={styles.titleBlock}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {hadSkips ? 'Good effort!' : 'Crushed it!'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {lessonTitle ?? 'Lesson'} complete
            </Text>
          </View>

          {hadSkips && (
            <View style={[styles.nudgeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
              <Text style={[styles.nudgeText, { color: colors.foreground }]}>
                You skipped {skippedSets} {skippedSets === 1 ? 'set' : 'sets'} this session — consider repeating this workout before moving on.
              </Text>
            </View>
          )}

          {/* Stats */}
          <Animated.View style={[styles.statsRow, { opacity: statsOpacity }]}>
            {[
              { icon: 'flame' as const, label: 'streak', value: String(state.streak) },
              { icon: 'barbell-outline' as const, label: 'workouts', value: String(state.workoutHistory.length) },
              { icon: 'medal' as const, label: 'level', value: String(level) },
            ].map((s, i) => (
              <View key={i} style={[styles.statBox, { backgroundColor: colors.card }]}>
                <Ionicons
                  name={s.icon}
                  size={20}
                  color={i === 0 ? colors.primary : i === 1 ? colors.accent : colors.primary}
                />
                <Text style={[styles.statVal, { color: colors.foreground }]}>{s.value}</Text>
                <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            ))}
          </Animated.View>
        </Animated.View>

        {/* Continue */}
        <View style={[styles.bottomBar, { backgroundColor: colors.background }]}>
          <Pressable
            style={({ pressed }) => [
              styles.continueBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={[styles.continueBtnText, { color: colors.primaryForeground }]}>
              Continue
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
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  trophyRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  titleBlock: { alignItems: 'center', gap: 6 },
  title: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  xpPill: {
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    gap: 4,
  },
  xpLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 2,
  },
  xpAmount: {
    fontSize: 52,
    fontFamily: 'Inter_700Bold',
    lineHeight: 60,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    alignSelf: 'stretch',
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 6,
  },
  statVal: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  statLbl: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
  },
  continueBtn: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  continueBtnText: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
  },
  nudgeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignSelf: 'stretch',
  },
  nudgeText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
});
