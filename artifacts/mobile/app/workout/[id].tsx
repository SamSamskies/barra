import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { canStartLesson, formatSetTarget, formatTargets, formatTargetUnit, getLessonById, RECOVERY_GUIDANCE, TRAINING_NOTICE } from '@/constants/track';
import { creditedIds } from '@/lib/progression';
import { focusSummary, movementCue, needsPlatform, PLATFORM_CUE, practiceCue, SETUP_CUE, STOP_CUE } from '@/constants/workoutCopy';
import { ExerciseDetails } from '@/components/WorkoutDetails';
import { Action, Body, Card, Disclosure, Heading, Page } from '@/components/TrainingUI';

export default function WorkoutRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <WorkoutScreen key={id} id={id ?? ''} />;
}
function WorkoutScreen({ id }: { id: string }) {
  const colors = useColors();
  const { state, saveSession, uncompleteLesson } = useApp();
  const [phase, setPhase] = useState<'intro' | 'work' | 'rest' | 'check' | 'undo'>('intro');
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(0);
  const [restSeconds, setRestSeconds] = useState(0);
  const [skippedSets, setSkippedSets] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const sessionId = useRef(`${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const saving = useRef(false);
  const found = getLessonById(id);
  useEffect(() => {
    if (phase !== 'rest') return;
    const timer = setInterval(() => setRestSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [phase]);
  useEffect(() => { if (phase === 'rest' && restSeconds === 0) setPhase('work'); }, [phase, restSeconds]);
  if (state.loading) return null;
  if (!state.onboardingComplete) return <Redirect href="/onboarding" />;
  if (!found) return <Page><Heading>Lesson not found</Heading><Body>The old roadmap has been replaced. Choose a lesson from the new path.</Body><Action title="Back to path" onPress={() => router.replace('/(tabs)')} /></Page>;
  const { lesson, node } = found;
  const credited = creditedIds(state);
  const unlocked = canStartLesson(id, credited);
  const mastered = state.completedLessonIds.includes(id);
  const assessed = state.assessedLessonIds.includes(id);
  const current = lesson.exercises[exerciseIdx]!;
  const totalSets = lesson.exercises.reduce((sum, ex) => sum + ex.targets.length, 0);
  const traversed = lesson.exercises.slice(0, exerciseIdx).reduce((sum, ex) => sum + ex.targets.length, 0) + setIdx;
  const equipment = [...new Set(lesson.exercises.flatMap(ex => ex.equipment))];
  const isAttempt = lesson.exercises.some(ex => ex.unit === 'attempts');
  const back = () => router.replace('/(tabs)');
  const finish = async (ready: boolean, actualSuccess: boolean) => {
    if (saving.current || !unlocked) return;
    saving.current = true;
    setBusy(true);
    try {
      await saveSession({ id: sessionId.current, lessonId: id, skippedSets,
        targetsMet: skippedSets === 0, ready, actualSuccess });
      router.replace({ pathname: '/workout/complete', params: { sessionId: sessionId.current } });
    } catch (e) {
      setError(`Could not save your session. Please retry: ${String(e)}`);
      setBusy(false);
      saving.current = false;
    }
  };
  const advance = (met: boolean) => {
    if (!unlocked) return;
    if (!met) setSkippedSets(s => s + 1);
    const lastSet = setIdx === current.targets.length - 1;
    const lastExercise = exerciseIdx === lesson.exercises.length - 1;
    if (lastSet && lastExercise) { setPhase('check'); return; }
    if (lastSet) { setExerciseIdx(i => i + 1); setSetIdx(0); }
    else setSetIdx(i => i + 1);
    const nextExercise = lastSet ? lesson.exercises[exerciseIdx + 1]! : current;
    setRestSeconds(Math.max(current.restSeconds, nextExercise.restSeconds));
    setPhase('rest');
  };
  const stopEarly = () => {
    setSkippedSets(s => s + totalSets - traversed);
    setPhase('check');
  };
  if (phase === 'undo') return <Page>
    <Heading>Remove lesson credit?</Heading>
    <Body>This removes completion and placement credit from this lesson onward so prerequisites stay consistent. All real sessions, including repeats, remain in history. Streak and session counts are unchanged.</Body>
    {!!error && <Body>{error}</Body>}
    <Action title="Remove credit, keep session history" disabled={busy} onPress={async () => {
      setBusy(true);
      try { await uncompleteLesson(id); back(); }
      catch (e) { setError(String(e)); setBusy(false); }
    }} />
    <Action secondary title="Cancel" onPress={() => setPhase('intro')} />
  </Page>;
  if (phase === 'intro' || !unlocked) return <Page compact>
    <Action secondary title="Back to path" onPress={back} />
    <Body>{node.title} · {mastered ? 'Completed · repeat available' : assessed ? 'Assessed at placement · no session required' : unlocked ? 'Your current step' : 'Locked · preview only'}</Body>
    <Heading>{lesson.title}</Heading>
    <Body>{focusSummary(lesson)}</Body>
    {lesson.exercises.map(ex => <Card key={ex.id}>
      <Heading small>{ex.name}</Heading>
      <Body>{formatTargets(ex)} · {ex.restSeconds}s rest · {ex.name === lesson.focus ? 'Focus' : 'Fixed'}</Body>
      {ex.variation !== 'standard' && <Body>Setup: {ex.variation}</Body>}
    </Card>)}
    <Body>Equipment: {equipment.join(' · ')}</Body>
    <Body>{SETUP_CUE} {STOP_CUE}</Body>
    {lesson.exercises.some(needsPlatform) && <Body>{PLATFORM_CUE}</Body>}
    {lesson.exercises.map(ex => <Body key={ex.id}>{ex.name}: {movementCue(ex)}</Body>)}
    {unlocked
      ? <Action title={mastered || assessed ? 'Repeat this workout' : 'Begin workout'} onPress={() => setPhase('work')} />
      : <Card><Body>Complete earlier lessons or choose a conservative entry during onboarding. Inspecting this lesson does not unlock it.</Body></Card>}
    {lesson.exercises.map(ex => <ExerciseDetails key={`intro-${ex.id}`} exercise={ex} />)}
    <Disclosure title="Targets, readiness & progression">
      <Body>Focus: {lesson.focus}. Supporting targets stay fixed.</Body>
      <Body>{lesson.change}</Body><Body>{lesson.readiness}</Body>
      <Body>Rest times are minimum guides; extend whenever needed.</Body>
    </Disclosure>
    <Disclosure title="Target help & plateau advice"><Body>{lesson.plateau}</Body></Disclosure>
    <Disclosure title="Training & recovery"><Body>{TRAINING_NOTICE}</Body><Body>{RECOVERY_GUIDANCE}</Body></Disclosure>
    {(mastered || assessed) && <Action secondary title="Remove credit from this step onward" onPress={() => setPhase('undo')} />}
  </Page>;
  if (phase === 'check') return <Page compact>
    <Heading>How did it go?</Heading>
    <Body>Your self-report, not automatic form verification. Confirm only controlled work.</Body>
    <Card>
      {skippedSets > 0 ? <Body>{skippedSets} sets skipped or unmet. Save practice; no new lesson unlocks.</Body>
        : <Body>Every target completed with control and reserve? Repeating or saving practice is always fine.</Body>}
    </Card>
    {skippedSets > 0 && <Body>{practiceCue(lesson)}</Body>}
    {isAttempt && <Body>Both attempts must be safe, controlled and fully rested. Failed attempts can complete attempt practice, not the muscle-up goal.</Body>}
    {lesson.requiresSuccess && <Body>Confirm only {lesson.exercises[0]!.targets.length === 1 ? 'one actual unassisted muscle-up' : 'both actual unassisted singles'}: controlled hang to steady straight-arm support, both arms together. Failed attempts, banded reps or one-arm turnovers do not count.</Body>}
    <Body>{STOP_CUE}</Body>
    {!!error && <Body>{error}</Body>}
    {skippedSets === 0 && <Action
      title={lesson.requiresSuccess ? 'Yes — actual controlled muscle-up success' : isAttempt ? 'All prescribed attempts were safe and controlled' : 'All targets completed with control'}
      disabled={busy} onPress={() => finish(true, !!lesson.requiresSuccess)} />}
    <Action secondary title={busy ? 'Saving…' : 'Save as practice — stay at this step'} disabled={busy} onPress={() => finish(false, false)} />
    <Disclosure title="Readiness details"><Body>{lesson.readiness}</Body></Disclosure>
    <Disclosure title="Practice & target help"><Body>{lesson.plateau}</Body></Disclosure>
  </Page>;
  if (phase === 'rest') return <Page compact>
    <Heading>Rest</Heading>
    <Text style={{ color: colors.foreground, textAlign: 'center', fontSize: 64, fontFamily: 'Inter_700Bold', marginVertical: 24 }}>{restSeconds}s</Text>
    <Card><Heading small>Up next: {current.name}</Heading>
      <Body>Set {setIdx + 1} of {current.targets.length} · {formatSetTarget(current, setIdx)}</Body></Card>
    <Action title="Add 60 seconds rest" onPress={() => setRestSeconds(s => s + 60)} />
    <Action secondary title="Skip rest" onPress={() => { setRestSeconds(0); setPhase('work'); }} />
    <Body>Start only when recovered and in control. Skipping rest does not affect credit. {STOP_CUE}</Body>
    <Action secondary title="End early and record practice" onPress={stopEarly} />
  </Page>;
  return <Page compact>
    <Body>{lesson.title} · {traversed}/{totalSets} sets reviewed</Body>
    <Heading>{current.name}</Heading>
    <Body>Set {setIdx + 1} of {current.targets.length} · {current.name === lesson.focus ? 'Focus' : 'Fixed supporting target'}</Body>
    <View testID="current-target-circle" style={[styles.targetCircle, { borderColor: colors.primary, backgroundColor: colors.card }]}>
      <Text style={[styles.targetNumber, { color: colors.primary }]}>{current.targets[setIdx]}</Text>
      <Body>{formatTargetUnit(current, current.targets[setIdx]!)}</Body>
    </View>
    <Body>{movementCue(current)} {STOP_CUE}</Body>
    {needsPlatform(current) && <Body>{PLATFORM_CUE}</Body>}
    {current.variation !== 'standard' && <Body>Setup: {current.variation}</Body>}
    <Action title={current.unit === 'attempts' ? 'Controlled attempt taken' : 'Target completed with control'} onPress={() => advance(true)} />
    <Action secondary title="Target unmet / skip this set" onPress={() => advance(false)} />
    <ExerciseDetails key={`work-${current.id}`} exercise={current} />
    <Disclosure key={`help-${current.id}-${setIdx}`} title="Cannot reach this target?">
      <Body>{practiceCue(lesson)}</Body><Body>{lesson.plateau}</Body>
      <Body>Assistance for a strict target means “Target unmet / skip this set”. Save practice without new credit.</Body>
    </Disclosure>
    <Body>{current.restSeconds}s rest after this set; extend as needed.</Body>
    <Action secondary title="End early and record practice" onPress={stopEarly} />
  </Page>;
}
const styles = StyleSheet.create({
  targetCircle: { alignSelf: 'center', width: 180, height: 180, borderRadius: 90, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
  targetNumber: { fontSize: 64, fontFamily: 'Inter_700Bold' },
});
