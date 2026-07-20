import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { getNextLesson } from '@/constants/track';

function isToday(dateStr: string): boolean {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

export default function TrainScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { state } = useApp();

  const next = getNextLesson(state.completedLessonIds);
  const completedToday =
    !!state.lastWorkoutDate && isToday(state.lastWorkoutDate);

  const handleStart = () => {
    if (!next) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push(`/workout/${next.lesson.id}`);
  };

  const webTopPad = Platform.OS === 'web' ? 67 : 0;
  const webBottomPad = Platform.OS === 'web' ? 34 : 0;

  // Track complete
  if (!next) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.completedFull,
            { paddingTop: insets.top + webTopPad, paddingBottom: insets.bottom + webBottomPad },
          ]}
        >
          <View style={[styles.trophyCircle, { backgroundColor: colors.card }]}>
            <Ionicons name="trophy" size={64} color={colors.accent} />
          </View>
          <Text style={[styles.completedTitle, { color: colors.foreground }]}>
            Track Complete!
          </Text>
          <Text style={[styles.completedSub, { color: colors.mutedForeground }]}>
            You have mastered the full progression. Muscle-up achieved.
          </Text>
        </View>
      </View>
    );
  }

  const { lesson, node } = next;
  const totalSets = lesson.exercises.reduce((sum, e) => sum + e.sets, 0);
  const estMinutes = Math.ceil(totalSets * 2.5);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + webTopPad + 20,
            paddingBottom: 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Node badge */}
        <View style={[styles.nodeBadge, { backgroundColor: node.nodeColor + '22' }]}>
          <Ionicons name={node.icon as any} size={14} color={node.nodeColor} />
          <Text style={[styles.nodeBadgeText, { color: node.nodeColor }]}>
            {node.title}
          </Text>
        </View>

        <Text style={[styles.lessonTitle, { color: colors.foreground }]}>
          {lesson.title}
        </Text>

        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {lesson.exercises.length} exercises · {totalSets} sets · ~{estMinutes} min
        </Text>

        {/* Exercise list */}
        <View style={styles.exList}>
          {lesson.exercises.map((ex, i) => (
            <View
              key={ex.id}
              style={[styles.exRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.exNumBubble, { backgroundColor: colors.primary }]}>
                <Text style={[styles.exNumText, { color: colors.primaryForeground }]}>
                  {i + 1}
                </Text>
              </View>
              <View style={styles.exInfo}>
                <Text style={[styles.exName, { color: colors.foreground }]}>{ex.name}</Text>
                <Text style={[styles.exDetail, { color: colors.mutedForeground }]}>
                  {ex.sets} sets × {ex.reps}
                  {typeof ex.reps === 'number' ? ' reps' : ''}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* XP reward */}
        <View style={[styles.xpBanner, { backgroundColor: colors.card, borderColor: colors.accent + '55' }]}>
          <Ionicons name="star" size={18} color={colors.accent} />
          <Text style={[styles.xpBannerText, { color: colors.foreground }]}>
            +{lesson.xpReward} XP on completion
          </Text>
        </View>
      </ScrollView>

      {/* Fixed bottom CTA */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + webBottomPad + 8,
          },
        ]}
      >
        {completedToday ? (
          <View style={[styles.doneToday, { backgroundColor: colors.card }]}>
            <Ionicons name="checkmark-circle" size={22} color={colors.success} />
            <Text style={[styles.doneTodayText, { color: colors.foreground }]}>
              Completed today — come back tomorrow
            </Text>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.startBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleStart}
          >
            <Ionicons name="play" size={20} color={colors.primaryForeground} />
            <Text style={[styles.startBtnText, { color: colors.primaryForeground }]}>
              Start Training
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  completedFull: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 20,
  },
  trophyCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  completedSub: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  scroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  nodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  nodeBadgeText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  lessonTitle: {
    fontSize: 30,
    fontFamily: 'Inter_700Bold',
    lineHeight: 36,
  },
  meta: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  exList: { gap: 10 },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  exNumBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exNumText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  exInfo: { flex: 1, gap: 3 },
  exName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  exDetail: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  xpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  xpBannerText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  doneToday: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 14,
  },
  doneTodayText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
  },
  startBtnText: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
  },
  success: {},
});
