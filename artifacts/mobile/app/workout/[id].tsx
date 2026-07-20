import React, { useEffect, useRef, useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { getLessonById } from '@/constants/track';
import { EXERCISE_DEMOS } from '@/constants/demos';

type Phase = 'intro' | 'work' | 'rest';

const REST_EXERCISES = 90;

export default function WorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { completeLesson } = useApp();

  const found = getLessonById(id ?? '');

  const [phase, setPhase] = useState<Phase>('intro');
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [restSeconds, setRestSeconds] = useState(60);
  const [restDuration, setRestDuration] = useState(60);
  const [skippedSets, setSkippedSets] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'rest') return;

    timerRef.current = setInterval(() => {
      setRestSeconds(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Advance when rest hits zero
  useEffect(() => {
    if (phase === 'rest' && restSeconds === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPhase('work');
    }
  }, [restSeconds, phase]);

  if (!found) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.safe}>
          <Text style={[styles.errorText, { color: colors.foreground }]}>Lesson not found.</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.link, { color: colors.primary }]}>Go back</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  const { lesson, node } = found;
  const currentExercise = lesson.exercises[exerciseIdx];

  let completedSets = 0;
  for (let i = 0; i < exerciseIdx; i++) completedSets += lesson.exercises[i]!.sets;
  completedSets += setIdx;
  const totalSets = lesson.exercises.reduce((s, e) => s + e.sets, 0);

  const startRest = (duration: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRestDuration(duration);
    setRestSeconds(duration);
    setPhase('rest');
  };

  const skipRest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRestSeconds(0);
    setPhase('work');
  };

  const advance = async () => {
    const isLastSet = setIdx >= currentExercise!.sets - 1;
    const isLastExercise = exerciseIdx >= lesson.exercises.length - 1;

    if (!isLastSet) {
      setSetIdx(prev => prev + 1);
    } else if (!isLastExercise) {
      setExerciseIdx(prev => prev + 1);
      setSetIdx(0);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await completeLesson(lesson.id);
      router.replace({
        pathname: '/workout/complete',
        params: { lessonTitle: lesson.title, skippedSets: String(skippedSets) },
      });
    }
  };

  const handleDoneSet = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const isLastSet = setIdx >= currentExercise!.sets - 1;
    const isLastExercise = exerciseIdx >= lesson.exercises.length - 1;
    if (isLastSet && isLastExercise) {
      await advance();
    } else if (isLastSet) {
      await advance();
      startRest(REST_EXERCISES);
    } else {
      await advance();
      startRest(currentExercise!.restSeconds);
    }
  };

  const handleSkipSet = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSkippedSets(prev => prev + 1);
    await advance();
  };

  const webTopPad = Platform.OS === 'web' ? 67 : 0;
  const isFinishBtn =
    setIdx >= (currentExercise?.sets ?? 1) - 1 &&
    exerciseIdx >= lesson.exercises.length - 1;

  // ── INTRO ──────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={[styles.safe, { paddingTop: webTopPad }]}>
          <View style={[styles.introHeader]}>
            <Pressable onPress={() => router.back()} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.introScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.nodeChip, { backgroundColor: node.nodeColor + '22' }]}>
              <Ionicons name={node.icon as any} size={14} color={node.nodeColor} />
              <Text style={[styles.nodeChipText, { color: node.nodeColor }]}>
                {node.title}
              </Text>
            </View>

            <Text style={[styles.introTitle, { color: colors.foreground }]}>
              {lesson.title}
            </Text>

            <View style={styles.summaryRow}>
              {[
                { icon: 'layers-outline' as const, label: `${lesson.exercises.length} exercises` },
                { icon: 'repeat-outline' as const, label: `${totalSets} sets` },
              ].map((b, i) => (
                <View
                  key={i}
                  style={[styles.summaryBadge, { backgroundColor: colors.card }]}
                >
                  <Ionicons
                    name={b.icon}
                    size={14}
                    color={colors.primary}
                  />
                  <Text style={[styles.summaryText, { color: colors.foreground }]}>
                    {b.label}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.exPreviewList}>
              {lesson.exercises.map((ex, i) => (
                <View
                  key={ex.id}
                  style={[styles.exPreviewRow, { backgroundColor: colors.card }]}
                >
                  <Text style={[styles.exPreviewNum, { color: colors.primary }]}>
                    {String(i + 1).padStart(2, '0')}
                  </Text>
                  <View style={styles.exPreviewInfo}>
                    <Text style={[styles.exPreviewName, { color: colors.foreground }]}>
                      {ex.name}
                    </Text>
                    <Text style={[styles.exPreviewDetail, { color: colors.mutedForeground }]}>
                      {ex.sets} × {ex.reps}
                      {typeof ex.reps === 'number' ? ' reps' : ''}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <View
            style={[
              styles.introCTA,
              { borderTopColor: colors.border, backgroundColor: colors.background },
            ]}
          >
            <Pressable
              style={({ pressed }) => [
                styles.bigBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={() => setPhase('work')}
            >
              <Ionicons name="play" size={22} color={colors.primaryForeground} />
              <Text style={[styles.bigBtnText, { color: colors.primaryForeground }]}>
                Begin
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── REST ───────────────────────────────────────────────
  if (phase === 'rest') {
    const progress = restDuration > 0 ? (restDuration - restSeconds) / restDuration : 0;
    const nextEx = lesson.exercises[exerciseIdx];

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={[styles.safe, { paddingTop: webTopPad }]}>
          <View style={styles.restContent}>
            <Text style={[styles.restLabel, { color: colors.mutedForeground }]}>REST</Text>
            <Text style={[styles.restTimer, { color: colors.foreground }]}>{restSeconds}</Text>
            <Text style={[styles.restUnit, { color: colors.mutedForeground }]}>seconds</Text>

            {nextEx && (
              <View style={[styles.nextCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.nextLabel, { color: colors.mutedForeground }]}>
                  UP NEXT
                </Text>
                <Text style={[styles.nextName, { color: colors.foreground }]}>
                  {nextEx.name}
                </Text>
                <Text style={[styles.nextDetail, { color: colors.primary }]}>
                  Set {setIdx + 1} of {nextEx.sets}
                </Text>
              </View>
            )}

            {/* Progress bar */}
            <View style={[styles.restTrack, { backgroundColor: colors.muted }]}>
              <View
                style={[
                  styles.restFill,
                  { backgroundColor: colors.primary, width: `${progress * 100}%` },
                ]}
              />
            </View>

            <Pressable
              onPress={skipRest}
              style={[styles.skipBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.skipText, { color: colors.mutedForeground }]}>
                Skip Rest
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── WORK ───────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={[styles.safe, { paddingTop: webTopPad }]}>
        {/* Top bar */}
        <View style={[styles.workTopBar, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={colors.mutedForeground} />
          </Pressable>
          <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${(completedSets / totalSets) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
            {completedSets}/{totalSets}
          </Text>
        </View>

        <View style={styles.workBody}>
          {/* Exercise title */}
          <Text style={[styles.exIndexLabel, { color: colors.primary }]}>
            Exercise {exerciseIdx + 1} of {lesson.exercises.length}
          </Text>
          <Text style={[styles.exTitle, { color: colors.foreground }]}>
            {currentExercise?.name}
          </Text>

          {/* Set dots */}
          <View style={styles.setDots}>
            {Array.from({ length: currentExercise?.sets ?? 1 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.setDot,
                  {
                    backgroundColor:
                      i < setIdx
                        ? colors.primary
                        : i === setIdx
                        ? colors.primary
                        : colors.muted,
                    opacity: i < setIdx ? 0.35 : 1,
                    width: i === setIdx ? 22 : 10,
                  },
                ]}
              />
            ))}
          </View>

          <Text style={[styles.setLabel, { color: colors.mutedForeground }]}>
            Set {setIdx + 1} of {currentExercise?.sets ?? 1}
          </Text>

          {/* Reps ring */}
          <View
            style={[
              styles.repsRing,
              { backgroundColor: colors.card, borderColor: colors.primary + '55' },
            ]}
          >
            <Text style={[styles.repsNum, { color: colors.primary }]}>
              {currentExercise?.reps}
            </Text>
            {typeof currentExercise?.reps === 'number' && (
              <Text style={[styles.repsUnit, { color: colors.mutedForeground }]}>reps</Text>
            )}
          </View>

          {/* Description */}
          <View style={[styles.descCard, { backgroundColor: colors.card }]}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={[styles.descText, { color: colors.foreground }]}>
              {currentExercise?.description}
            </Text>
          </View>

          {/* Watch demo */}
          {currentExercise && EXERCISE_DEMOS[currentExercise.name] && (
            <Pressable
              style={({ pressed }) => [styles.demoBtn, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Linking.openURL(EXERCISE_DEMOS[currentExercise.name]!);
              }}
            >
              <Ionicons name="logo-youtube" size={16} color="#FF0000" />
              <Text style={[styles.demoBtnText, { color: colors.foreground }]}>
                Watch demo
              </Text>
              <Ionicons name="open-outline" size={14} color={colors.mutedForeground} />
            </Pressable>
          )}

          {/* Rest time */}
          {!isFinishBtn && (
            <View style={styles.restHint}>
              <Ionicons name="timer-outline" size={15} color={colors.mutedForeground} />
              <Text style={[styles.restHintText, { color: colors.mutedForeground }]}>
                {currentExercise?.restSeconds}s rest after each set
              </Text>
            </View>
          )}
        </View>

        {/* Done button */}
        <View
          style={[
            styles.workCTA,
            { borderTopColor: colors.border, backgroundColor: colors.background },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.bigBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleDoneSet}
          >
            <Ionicons
              name={isFinishBtn ? 'trophy-outline' : 'checkmark'}
              size={22}
              color={colors.primaryForeground}
            />
            <Text style={[styles.bigBtnText, { color: colors.primaryForeground }]}>
              {isFinishBtn ? 'Finish Workout' : 'Done Set'}
            </Text>
          </Pressable>

          {!isFinishBtn && (
            <Pressable style={styles.skipSetBtn} onPress={handleSkipSet}>
              <Text style={[styles.skipSetBtnText, { color: colors.mutedForeground }]}>
                Skip set
              </Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 60,
  },
  link: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    marginTop: 12,
  },

  // Intro
  introHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeBtn: { padding: 6 },
  introScroll: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 20,
  },
  nodeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  nodeChipText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  introTitle: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    lineHeight: 40,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  summaryText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  exPreviewList: { gap: 8 },
  exPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 16,
  },
  exPreviewNum: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    width: 30,
  },
  exPreviewInfo: { flex: 1, gap: 2 },
  exPreviewName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  exPreviewDetail: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  introCTA: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
  },
  bigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
  },
  bigBtnText: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },

  // Rest
  restContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 24,
  },
  restLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 3,
  },
  restTimer: {
    fontSize: 88,
    fontFamily: 'Inter_700Bold',
    lineHeight: 100,
  },
  restUnit: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    marginTop: -18,
  },
  nextCard: {
    width: '100%',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
  nextLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 2,
  },
  nextName: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  nextDetail: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  restTrack: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  restFill: {
    height: '100%',
    borderRadius: 3,
  },
  skipBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },

  // Work
  workTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    minWidth: 30,
    textAlign: 'right',
  },
  workBody: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 18,
    alignItems: 'center',
  },
  exIndexLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
  },
  exTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  setDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  setDot: {
    height: 10,
    borderRadius: 5,
  },
  setLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  repsRing: {
    width: 155,
    height: 155,
    borderRadius: 78,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    gap: 2,
  },
  repsNum: {
    fontSize: 52,
    fontFamily: 'Inter_700Bold',
    lineHeight: 58,
  },
  repsUnit: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  descCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    alignSelf: 'stretch',
  },
  descText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
  },
  restHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
  },
  restHintText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  skipSetBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipSetBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  demoBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  workCTA: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
  },
});
