import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { XPBar } from '@/components/XPBar';
import { StreakBadge } from '@/components/StreakBadge';
import { TRACK_NODES, getLevelInfo } from '@/constants/track';

function lessonIdToLabel(id: string): string {
  return id
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { state } = useApp();

  const { level, nextXP } = getLevelInfo(state.xp);
  const xpToNext = nextXP - state.xp;

  const completedNodes = TRACK_NODES.filter(n =>
    n.lessons.every(l => state.completedLessonIds.includes(l.id))
  ).length;

  const totalLessons = TRACK_NODES.reduce((sum, n) => sum + n.lessons.length, 0);

  const webTopPad = Platform.OS === 'web' ? 67 : 0;
  const webBottomPad = Platform.OS === 'web' ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + webTopPad + 20,
            paddingBottom: insets.bottom + webBottomPad + 20,
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Progress</Text>

        {/* Level card */}
        <View
          style={[
            styles.levelCard,
            { backgroundColor: colors.card, borderColor: colors.primary + '44' },
          ]}
        >
          <View style={styles.levelTop}>
            <View>
              <Text style={[styles.levelLabel, { color: colors.mutedForeground }]}>LEVEL</Text>
              <Text style={[styles.levelNum, { color: colors.primary }]}>{level}</Text>
            </View>
            <StreakBadge streak={state.streak} size="large" />
          </View>
          <XPBar xp={state.xp} />
          <Text style={[styles.xpToNext, { color: colors.mutedForeground }]}>
            {xpToNext.toLocaleString()} XP to Level {level + 1}
          </Text>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {[
            { icon: 'barbell-outline' as const, label: 'Lessons', value: state.completedLessonIds.length, total: totalLessons },
            { icon: 'flag-outline' as const, label: 'Nodes', value: completedNodes, total: TRACK_NODES.length },
            { icon: 'calendar-outline' as const, label: 'Workouts', value: state.workoutHistory.length, total: null },
          ].map((s, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Ionicons name={s.icon} size={22} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {s.value}
                {s.total !== null && (
                  <Text style={[styles.statDenom, { color: colors.mutedForeground }]}>
                    /{s.total}
                  </Text>
                )}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Node progress */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Track Progress</Text>

        <View style={styles.nodeList}>
          {TRACK_NODES.map(node => {
            const done = node.lessons.filter(l =>
              state.completedLessonIds.includes(l.id)
            ).length;
            const total = node.lessons.length;
            const pct = total > 0 ? done / total : 0;

            return (
              <View key={node.id} style={styles.nodeRow}>
                <View
                  style={[
                    styles.nodeIconBox,
                    { backgroundColor: node.nodeColor + '22' },
                  ]}
                >
                  <Ionicons
                    name={node.icon as any}
                    size={18}
                    color={node.nodeColor}
                  />
                </View>
                <View style={styles.nodeInfo}>
                  <View style={styles.nodeRowTop}>
                    <Text style={[styles.nodeName, { color: colors.foreground }]}>
                      {node.title}
                    </Text>
                    <Text style={[styles.nodeCount, { color: colors.mutedForeground }]}>
                      {done}/{total}
                    </Text>
                  </View>
                  <View style={[styles.nodeTrack, { backgroundColor: colors.muted }]}>
                    <View
                      style={[
                        styles.nodeFill,
                        { backgroundColor: node.nodeColor, width: `${pct * 100}%` },
                      ]}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Recent workouts */}
        {state.workoutHistory.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Recent Workouts
            </Text>
            <View style={styles.historyList}>
              {state.workoutHistory.slice(0, 10).map((record, i) => (
                <View key={i} style={[styles.historyRow, { backgroundColor: colors.card }]}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <View style={styles.historyInfo}>
                    <Text style={[styles.historyName, { color: colors.foreground }]}>
                      {lessonIdToLabel(record.lessonId)}
                    </Text>
                    <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>
                      {new Date(record.completedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  <Text style={[styles.historyXP, { color: colors.accent }]}>
                    +{record.xpEarned}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
  },
  levelCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 12,
  },
  levelTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  levelLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.5,
  },
  levelNum: {
    fontSize: 52,
    fontFamily: 'Inter_700Bold',
    lineHeight: 60,
  },
  xpToNext: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
  },
  statDenom: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    marginTop: 4,
  },
  nodeList: { gap: 14 },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nodeIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeInfo: { flex: 1, gap: 6 },
  nodeRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nodeName: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  nodeCount: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  nodeTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  nodeFill: {
    height: '100%',
    borderRadius: 3,
  },
  historyList: { gap: 8 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 10,
  },
  historyInfo: { flex: 1, gap: 2 },
  historyName: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  historyDate: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  historyXP: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  success: {},
});
