import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { PathNode } from '@/components/PathNode';
import { XPBar } from '@/components/XPBar';
import { StreakBadge } from '@/components/StreakBadge';
import {
  TRACK_NODES,
  getNodeProgress,
  getNodeStatus,
  getNextLesson,
} from '@/constants/track';

// Top-to-bottom path: Foundation at top, Muscle-up at bottom
const ALIGNMENTS: ('left' | 'center' | 'right')[] = [
  'center', // Foundation
  'right',  // Strength Base
  'left',   // Power Up
  'right',  // Archer
  'center', // Negatives
  'left',   // Transition
  'center', // Muscle-up
];

export default function PathScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { state } = useApp();

  if (state.loading) return null;

  if (!state.onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  const next = getNextLesson(state.completedLessonIds);

  const handleNodePress = (nodeId: string) => {
    const node = TRACK_NODES.find(n => n.id === nodeId);
    if (!node) return;
    const nextLesson = node.lessons.find(
      l => !state.completedLessonIds.includes(l.id)
    );
    if (nextLesson) {
      router.push(`/workout/${nextLesson.id}`);
    }
  };

  const webTopPad = Platform.OS === 'web' ? 67 : 0;
  const webBottomPad = Platform.OS === 'web' ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + webTopPad,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.appName, { color: colors.foreground }]}>
            Barra
          </Text>
          <StreakBadge streak={state.streak} />
        </View>
        <XPBar xp={state.xp} compact />
      </View>

      {/* Scrollable path */}
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom: tabBarHeight + webBottomPad + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Start label */}
        <View style={styles.pathLabelRow}>
          <View style={[styles.pathLabelLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.pathLabel, { color: colors.mutedForeground }]}>START</Text>
          <View style={[styles.pathLabelLine, { backgroundColor: colors.border }]} />
        </View>

        {TRACK_NODES.map((node, idx) => {
          const alignment = ALIGNMENTS[idx] ?? 'center';
          const status = getNodeStatus(node.id, state.completedLessonIds);
          const progress = getNodeProgress(node.id, state.completedLessonIds);
          const isLast = idx === TRACK_NODES.length - 1;

          return (
            <View key={node.id}>
              {/* Node row */}
              <View
                style={[
                  styles.nodeRow,
                  alignment === 'left' && styles.nodeLeft,
                  alignment === 'center' && styles.nodeCenter,
                  alignment === 'right' && styles.nodeRight,
                ]}
              >
                <PathNode
                  title={node.title}
                  icon={node.icon}
                  nodeColor={node.nodeColor}
                  status={status}
                  progress={progress}
                  onPress={() => handleNodePress(node.id)}
                />
              </View>

              {/* Connector */}
              {!isLast && (
                <View
                  style={[
                    styles.connector,
                    alignment === 'left' && styles.connLeft,
                    alignment === 'center' && styles.connCenter,
                    alignment === 'right' && styles.connRight,
                  ]}
                >
                  {[0, 1, 2, 3].map(i => (
                    <View
                      key={i}
                      style={[
                        styles.connDot,
                        {
                          backgroundColor:
                            status === 'completed'
                              ? colors.primary
                              : colors.border,
                        },
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Goal label */}
        <View style={styles.pathLabelRow}>
          <View style={[styles.pathLabelLine, { backgroundColor: colors.border }]} />
          <View style={styles.goalChip}>
            <Ionicons name="trophy" size={14} color={colors.accent} />
            <Text style={[styles.goalText, { color: colors.accent }]}>
              GOAL: MUSCLE-UP
            </Text>
          </View>
          <View style={[styles.pathLabelLine, { backgroundColor: colors.border }]} />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      {next && (
        <View
          style={[
            styles.bottomCTA,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + webBottomPad + 8,
            },
          ]}
        >
          <View style={styles.nextRow}>
            <View style={styles.nextInfo}>
              <Text style={[styles.nextHint, { color: colors.mutedForeground }]}>
                Up next
              </Text>
              <Text style={[styles.nextName, { color: colors.foreground }]} numberOfLines={1}>
                {next.lesson.title}
              </Text>
            </View>
            <View
              style={[styles.nextXpBadge, { backgroundColor: colors.card }]}
            >
              <Ionicons name="star" size={14} color={colors.accent} />
              <Text style={[styles.nextXpText, { color: colors.accent }]}>
                +{next.lesson.xpReward}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appName: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  scroll: {
    paddingTop: 28,
    paddingHorizontal: 20,
    gap: 0,
  },
  pathLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  pathLabelLine: {
    flex: 1,
    height: 1,
  },
  pathLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 2,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  goalText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
  nodeRow: {
    marginBottom: 0,
  },
  nodeLeft: {
    alignItems: 'flex-start',
    paddingLeft: 24,
  },
  nodeCenter: {
    alignItems: 'center',
  },
  nodeRight: {
    alignItems: 'flex-end',
    paddingRight: 24,
  },
  connector: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 16,
  },
  connLeft: {
    alignItems: 'flex-start',
    paddingLeft: 64,
  },
  connCenter: {
    alignItems: 'center',
  },
  connRight: {
    alignItems: 'flex-end',
    paddingRight: 64,
  },
  connDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextInfo: { gap: 2 },
  nextHint: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.5,
  },
  nextName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    maxWidth: 220,
  },
  nextXpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  nextXpText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
});
