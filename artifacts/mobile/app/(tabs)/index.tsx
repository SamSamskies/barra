import React, { useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { PathNode } from '@/components/PathNode';
import { StreakBadge } from '@/components/StreakBadge';
import {
  TRACK_NODES,
  getNodeProgress,
  getNodeStatus,
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
  const { state, uncompleteLesson, completeLesson } = useApp();
  const [pickerNode, setPickerNode] = useState<typeof TRACK_NODES[0] | null>(null);

  if (state.loading) return null;

  if (!state.onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  const handleNodePress = (nodeId: string) => {
    const node = TRACK_NODES.find(n => n.id === nodeId);
    if (!node) return;
    setPickerNode(node);
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
      </View>

      {/* Scrollable path */}
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom: insets.bottom + (Platform.OS !== 'web' ? 49 : 0) + webBottomPad + 20,
          },
        ]}
        contentInsetAdjustmentBehavior="automatic"
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

      {/* Lesson picker modal */}
      <Modal
        visible={pickerNode !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerNode(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerNode(null)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.card }]} onPress={() => {}}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                  {pickerNode?.title}
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.mutedForeground }]}>
                  Select a lesson
                </Text>
              </View>
              <Pressable
                onPress={() => setPickerNode(null)}
                hitSlop={12}
                style={[styles.modalCloseBtn, { backgroundColor: colors.background }]}
              >
                <Ionicons name="close" size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <View style={styles.modalLessons}>
              {pickerNode?.lessons.map((lesson, i) => {
                const done = state.completedLessonIds.includes(lesson.id);
                const isNext = !done && pickerNode.lessons
                  .slice(0, i)
                  .every(l => state.completedLessonIds.includes(l.id));
                return (
                  <Pressable
                    key={lesson.id}
                    style={({ pressed }) => [
                      styles.modalLessonRow,
                      { backgroundColor: colors.background, opacity: pressed ? 0.75 : 1 },
                    ]}
                    onPress={() => {
                      if (done) {
                        Alert.alert(
                          lesson.title,
                          'What would you like to do?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Mark as not done',
                              style: 'destructive',
                              onPress: () => {
                                setPickerNode(null);
                                uncompleteLesson(lesson.id);
                              },
                            },
                            {
                              text: 'Repeat workout',
                              onPress: () => {
                                setPickerNode(null);
                                router.push(`/workout/${lesson.id}`);
                              },
                            },
                          ]
                        );
                      } else {
                        setPickerNode(null);
                        router.push(`/workout/${lesson.id}`);
                      }
                    }}
                  >
                    <View style={[styles.modalLessonNum, { backgroundColor: done ? colors.primary + '22' : colors.card }]}>
                      {done
                        ? <Ionicons name="checkmark" size={15} color={colors.primary} />
                        : <Text style={[styles.modalLessonNumText, { color: isNext ? colors.primary : colors.mutedForeground }]}>
                            {String(i + 1).padStart(2, '0')}
                          </Text>
                      }
                    </View>
                    <View style={styles.modalLessonInfo}>
                      <Text style={[styles.modalLessonName, { color: colors.foreground }]}>
                        {lesson.title}
                      </Text>
                      <Text style={[styles.modalLessonDetail, { color: colors.mutedForeground }]}>
                        {lesson.exercises.length} exercises
                        {done ? ' · completed' : isNext ? ' · up next' : ''}
                      </Text>
                    </View>
                    <Ionicons
                      name={done ? 'refresh-outline' : 'play-outline'}
                      size={18}
                      color={colors.mutedForeground}
                    />
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  nextXpText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 4,
  },
  modalHeaderText: {
    flex: 1,
    gap: 4,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: -8,
  },
  modalLessons: {
    gap: 10,
  },
  modalLessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
  },
  modalLessonNum: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLessonNumText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  modalLessonInfo: {
    flex: 1,
    gap: 2,
  },
  modalLessonName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  modalLessonDetail: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
});
