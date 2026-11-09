import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { getLessonById, getNextLesson, GOAL_LESSON_ID, RECOVERY_GUIDANCE } from '@/constants/track';
import { creditedIds } from '@/lib/progression';
import { practiceCue } from '@/constants/workoutCopy';
import { Action, Body, Card, Disclosure, Heading, Page } from '@/components/TrainingUI';

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
  const attemptPractice = found.lesson.exercises.some(ex => ex.unit === 'attempts');
  const goal = state.completedLessonIds.includes(GOAL_LESSON_ID);
  const firstSuccess = record.lessonId === GOAL_LESSON_ID && record.outcome === 'mastered';
  return <Page compact>
    <Ionicons name={practice ? 'refresh-circle-outline' : 'checkmark-circle-outline'} size={64} color={colors.primary} />
    <Heading>{firstSuccess ? 'First muscle-up achieved!' : practice ? 'Practice recorded' : attemptPractice ? (record.outcome === 'repeat' ? 'Attempt-practice repeat recorded' : 'Attempt practice completed') : record.outcome === 'repeat' ? 'Successful repeat recorded' : 'Step completed with control'}</Heading>
    <Body>{found.lesson.title}</Body>
    <Card><Body>{practice
      ? 'Saved as a real session, without new credit. Recover and repeat this step.'
      : record.outcome === 'repeat'
        ? 'Another real session; no duplicate lesson credit.'
        : 'Controlled targets confirmed by you. Repeat or preview the next step; no automatic advancement.'}</Body></Card>
    {!practice && attemptPractice && <Body>Attempt practice completed, not the muscle-up goal. Only an actual controlled unassisted rep achieves it.</Body>}
    {practice && <Body>{practiceCue(found.lesson)}</Body>}
    {goal && <Body>Goal achieved by self-reported controlled unassisted success. Keep clean singles at your pace; no advanced variations required.</Body>}
    <Body>Recover before hard pulling. Stop for pain or loss of control.</Body>
    <Action title={practice ? 'Retry this lesson after recovery' : 'Repeat this workout'} onPress={() => router.replace(`/workout/${record.lessonId}`)} />
    {!practice && next && next.lesson.id !== record.lessonId && <Action secondary title={`Preview next: ${next.lesson.title}`} onPress={() => router.replace(`/workout/${next.lesson.id}`)} />}
    {!next && <Body>The roadmap is complete. Keep repeating recovered clean sessions as useful.</Body>}
    <Action secondary title="Back to path" onPress={() => router.replace('/(tabs)')} />
    {practice && <Disclosure title="Practice & target help"><Body>{found.lesson.plateau}</Body></Disclosure>}
    <Disclosure title="Recovery & session details">
      <Body>{RECOVERY_GUIDANCE}</Body>
      <Body>{state.workoutHistory.length} sessions · {state.completedLessonIds.length} completed lessons · {state.assessedLessonIds.filter(id => !state.completedLessonIds.includes(id)).length} placement-only</Body>
    </Disclosure>
  </Page>;
}
