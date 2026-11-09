import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { StreakBadge } from '@/components/StreakBadge';
import { Action, Body, Card, Heading, Page } from '@/components/TrainingUI';
import { ALL_LESSONS, TRACK_NODES, getCurrentLevel, getLessonById, GOAL_LESSON_ID, RECOVERY_GUIDANCE } from '@/constants/track';
import { creditedIds } from '@/lib/progression';
import { useColors } from '@/hooks/useColors';

export default function ProgressScreen() {
  const { state, resetProgress } = useApp();
  const colors = useColors();
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (state.loading) return null;
  if (!state.onboardingComplete) return <Redirect href="/onboarding" />;
  const { level, node } = getCurrentLevel(creditedIds(state));
  const placementOnly = state.assessedLessonIds.filter(id => !state.completedLessonIds.includes(id));
  const goal = state.completedLessonIds.includes(GOAL_LESSON_ID);
  return <Page>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Heading>Progress</Heading><StreakBadge streak={state.streak} />
    </View>
    <Card>
      <Heading small>{goal ? 'First muscle-up achieved' : `Phase ${level} of ${TRACK_NODES.length}: ${node.title}`}</Heading>
      <Body>{goal ? 'Confirmed by your report of an actual controlled unassisted rep.' : 'The goal requires an actual controlled unassisted rep, not just attempts.'}</Body>
      <Body>{state.completedLessonIds.length} / {ALL_LESSONS.length} lessons completed in workouts</Body>
      <Body>{placementOnly.length} earlier lessons assessed for placement only</Body>
      <Body>{state.workoutHistory.length} workout sessions, including practice and repeats</Body>
    </Card>
    <Body>{RECOVERY_GUIDANCE}</Body>
    <Heading small>Roadmap progress</Heading>
    {TRACK_NODES.map(phase => {
      const completed = phase.lessons.filter(l => state.completedLessonIds.includes(l.id)).length;
      const assessed = phase.lessons.filter(l => placementOnly.includes(l.id)).length;
      return <Card key={phase.id}>
        <Text style={{ color: phase.nodeColor, fontFamily: 'Inter_600SemiBold', fontSize: 17 }}>{phase.title}</Text>
        <Body>{completed} completed · {assessed} placement-only · {phase.lessons.length} lessons</Body>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.muted }}>
          <View style={{ height: 6, borderRadius: 3, width: `${(completed + assessed) / phase.lessons.length * 100}%`, backgroundColor: phase.nodeColor }} />
        </View>
      </Card>;
    })}
    <Heading small>Session history</Heading>
    {state.workoutHistory.length === 0 && <Body>No workouts yet. Placement is not a performed session.</Body>}
    {state.workoutHistory.map(record => <Card key={record.id}>
      <Heading small>{getLessonById(record.lessonId)?.lesson.title ?? 'Unknown lesson'}</Heading>
      <Body>{record.outcome === 'practice' ? 'Practice / retry · no new mastery' : record.outcome === 'repeat' ? 'Successful repeat · no duplicate mastery' : 'Controlled prescription completed'}</Body>
      <Body>{new Date(record.completedAt).toLocaleString()}</Body>
      {record.skippedSets > 0 && <Body>{record.skippedSets} sets skipped or unmet</Body>}
      <Action secondary title="Preview / repeat this lesson" onPress={() => router.push(`/workout/${record.lessonId}`)} />
    </Card>)}
    {confirmReset ? <Card>
      <Heading small>Clear all new local progress?</Heading>
      <Body>This clears placement, completed lessons, every session and streak on this device. It cannot be undone. You will choose a fresh starting point.</Body>
      {!!error && <Body>{error}</Body>}
      <Action title={busy ? 'Resetting…' : 'Clear progress and start fresh'} disabled={busy} onPress={async () => {
        setBusy(true);
        try { await resetProgress(); router.replace('/onboarding'); }
        catch (e) { setError(`Could not reset: ${String(e)}`); setBusy(false); }
      }} />
      <Action secondary title="Keep my progress" disabled={busy} onPress={() => setConfirmReset(false)} />
    </Card> : <Action secondary title="Reset local progress" onPress={() => setConfirmReset(true)} />}
  </Page>;
}
