import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { getLessonById, getNextLesson, GOAL_LESSON_ID, RECOVERY_GUIDANCE } from '@/constants/track';
import { creditedIds } from '@/lib/progression';
import { Action, Body, Card, Heading, Page } from '@/components/TrainingUI';

export default function CompleteScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { state } = useApp();
  const colors = useColors();
  if (state.loading) return null;
  const record = state.workoutHistory.find(r => r.id === sessionId);
  if (!record) return <Page><Heading>No saved session</Heading><Body>Complete a workout to record a session.</Body><Action title="Back to path" onPress={() => router.replace('/(tabs)')} /></Page>;
  const found = getLessonById(record.lessonId)!;
  const next = getNextLesson(creditedIds(state));
  const practice = record.outcome === 'practice';
  const goal = state.completedLessonIds.includes(GOAL_LESSON_ID);
  const firstSuccess = record.lessonId === GOAL_LESSON_ID && record.outcome === 'mastered';
  return <Page>
    <Ionicons name={practice ? 'refresh-circle-outline' : 'checkmark-circle-outline'} size={64} color={colors.primary} />
    <Heading>{firstSuccess ? 'First muscle-up achieved!' : practice ? 'Practice recorded' : record.outcome === 'repeat' ? 'Successful repeat recorded' : 'Step completed with control'}</Heading>
    <Body>{found.lesson.title}</Body>
    <Card><Body>{practice
      ? 'Targets were skipped, unmet, or not confirmed controlled. No new lesson was unlocked. Stay here, recover, and repeat; useful practice counts as a real session.'
      : record.outcome === 'repeat'
        ? 'This is another real workout session. Lesson mastery is not awarded twice.'
        : found.lesson.exercises.some(ex => ex.unit === 'attempts')
          ? 'Attempt practice is complete, not the muscle-up goal. The next milestone requires an actual unassisted success.'
          : 'Your self-reported controlled prescription is complete. Choose to repeat or inspect the next step; advancement is not automatic.'}</Body></Card>
    {practice && <Card><Heading small>How to build toward the target</Heading><Body>{found.lesson.plateau}</Body></Card>}
    {goal && <Body>Goal achieved by self-reported controlled unassisted success. Continue with clean singles at your own pace; no advanced variations required.</Body>}
    <Body>{state.workoutHistory.length} sessions · {state.completedLessonIds.length} completed lessons · {state.assessedLessonIds.filter(id => !state.completedLessonIds.includes(id)).length} placement-only</Body>
    <Body>{RECOVERY_GUIDANCE}</Body>
    <Action title={practice ? 'Retry this lesson after recovery' : 'Repeat this workout'} onPress={() => router.replace(`/workout/${record.lessonId}`)} />
    {!practice && next && next.lesson.id !== record.lessonId && <Action secondary title={`Preview next: ${next.lesson.title}`} onPress={() => router.replace(`/workout/${next.lesson.id}`)} />}
    {!next && <Body>The roadmap is complete. Keep repeating recovered clean sessions as useful.</Body>}
    <Action secondary title="Back to path" onPress={() => router.replace('/(tabs)')} />
  </Page>;
}
