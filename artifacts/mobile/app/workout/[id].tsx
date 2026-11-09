import React, { useEffect, useRef, useState } from 'react';
import { Linking, Text, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { canStartLesson, formatSetTarget, formatTargets, getLessonById, RECOVERY_GUIDANCE, TRAINING_NOTICE } from '@/constants/track';
import { creditedIds } from '@/lib/progression';
import { EXERCISE_DEMOS } from '@/constants/demos';
import { Action, Body, Card, Heading, Page } from '@/components/TrainingUI';

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
  const [showHelp, setShowHelp] = useState(false);
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
    setShowHelp(false);
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
  if (phase === 'intro' || !unlocked) return <Page>
    <Action secondary title="Back to path" onPress={back} />
    <Body>{node.title} · {mastered ? 'Completed · repeat available' : assessed ? 'Assessed at placement · no session required' : unlocked ? 'Your current step' : 'Locked · preview only'}</Body>
    <Heading>{lesson.title}</Heading>
    <Card><Heading small>Session focus: {lesson.focus}</Heading>
      <Body>{lesson.exercises.length > 1 ? 'A mixed session with one progression focus. Supporting work stays fixed while the focus changes.' : 'A short focused session; extra volume is not required.'}</Body>
      <Body>{lesson.change}</Body></Card>
    <Card><Heading small>If you cannot reach the target</Heading><Body>{lesson.plateau}</Body></Card>
    <Card><Heading small>Before you start</Heading><Body>{lesson.readiness}</Body>
      <Body>Equipment: {equipment.join(' · ')}</Body><Body>{TRAINING_NOTICE}</Body></Card>
    {lesson.exercises.map(ex => <Card key={ex.id}>
      <Heading small>{ex.name}</Heading>
      <Body>{ex.name === lesson.focus ? 'Session focus' : 'Fixed supporting work'}</Body>
      <Text style={{ color: colors.primary, fontSize: 20, fontFamily: 'Inter_700Bold' }}>{formatTargets(ex)}</Text>
      <Body>Rest {ex.restSeconds} seconds between sets; extend whenever needed.</Body>
      <Body>{ex.description}</Body>
      {ex.variation !== 'standard' && <Body>Setup: {ex.variation}. Repeat the step before changing assistance again.</Body>}
      <Action secondary title={`Find a demo: ${ex.name}`} onPress={() => { void Linking.openURL(EXERCISE_DEMOS[ex.name]!); }} />
    </Card>)}
    <Body>{RECOVERY_GUIDANCE}</Body>
    {unlocked
      ? <Action title={mastered || assessed ? 'Repeat this workout' : 'Begin workout'} onPress={() => setPhase('work')} />
      : <Card><Body>Complete earlier lessons or choose a conservative entry during onboarding. Inspecting this lesson does not unlock it.</Body></Card>}
    {(mastered || assessed) && <Action secondary title="Remove credit from this step onward" onPress={() => setPhase('undo')} />}
  </Page>;
  if (phase === 'check') return <Page>
    <Heading>How did it go?</Heading>
    <Body>This is your own readiness report, not automatic form verification. Finishing the screen does not prove mastery.</Body>
    <Card>
      <Body>{lesson.readiness}</Body>
      {skippedSets > 0 ? <Body>{skippedSets} prescribed sets were skipped or unmet. This session will be recorded as practice and will not unlock a lesson.</Body>
        : <Body>Did you complete every target with control and enough reserve to repeat the quality? It is always fine to stay here and practice.</Body>}
    </Card>
    {skippedSets > 0 && <Card><Heading small>For your next session</Heading><Body>{lesson.plateau}</Body></Card>}
    {isAttempt && <Body>Safe, fully rested attempts can complete this attempt-practice lesson. Failed attempts do not count as successful muscle-ups and do not achieve the goal.</Body>}
    {lesson.requiresSuccess && <Body>Only confirm success if you actually completed {lesson.exercises[0]!.targets.length === 1 ? 'the unassisted muscle-up' : 'both unassisted muscle-up singles'} from controlled hang to steady support. Attempts, banded reps or a one-arm turnover do not count.</Body>}
    {!!error && <Body>{error}</Body>}
    {skippedSets === 0 && <Action
      title={lesson.requiresSuccess ? 'Yes — actual controlled muscle-up success' : isAttempt ? 'All prescribed attempts were safe and controlled' : 'All targets completed with control'}
      disabled={busy} onPress={() => finish(true, !!lesson.requiresSuccess)} />}
    <Action secondary title={busy ? 'Saving…' : 'Save as practice — stay at this step'} disabled={busy} onPress={() => finish(false, false)} />
  </Page>;
  if (phase === 'rest') return <Page>
    <Body>REST · take more time if needed</Body>
    <Text style={{ color: colors.foreground, textAlign: 'center', fontSize: 64, fontFamily: 'Inter_700Bold', marginVertical: 24 }}>{restSeconds}s</Text>
    <Card><Heading small>Up next: {current.name}</Heading>
      <Body>Set {setIdx + 1} of {current.targets.length} · {formatSetTarget(current, setIdx)}</Body></Card>
    <Action title="Add 60 seconds rest" onPress={() => setRestSeconds(s => s + 60)} />
    <Action secondary title="Skip rest" onPress={() => { setRestSeconds(0); setPhase('work'); }} />
    <Body>Skipping rest does not invalidate the session. Start only when recovered enough for control.</Body>
    <Action secondary title="End early and record practice" onPress={stopEarly} />
  </Page>;
  return <Page>
    <Body>{lesson.title} · {traversed}/{totalSets} sets reviewed</Body>
    <Heading>{current.name}</Heading>
    <Body>{current.name === lesson.focus ? 'Session focus' : 'Fixed supporting work — do not increase this target'}</Body>
    <Body>Set {setIdx + 1} of {current.targets.length}</Body>
    <View style={{ alignSelf: 'center', width: 220, height: 220, borderRadius: 110, borderWidth: 3, borderColor: colors.primary + '55', backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: colors.primary, fontSize: 64, fontFamily: 'Inter_700Bold' }}>{current.targets[setIdx]}</Text>
      <Body>{current.unit}</Body>
    </View>
    <Body>All set targets: {formatTargets(current)}</Body>
    <Card><Body>{current.description}</Body>
      <Body>Equipment: {current.equipment.join(' · ')}</Body>
      {current.variation !== 'standard' && <Body>Setup: {current.variation}</Body>}</Card>
    <Action secondary title="Watch demo search" onPress={() => { void Linking.openURL(EXERCISE_DEMOS[current.name]!); }} />
    <Body>{current.restSeconds}s recovery after this set. Keep the same assistance, range and control.</Body>
    <Action title={current.unit === 'attempts' ? 'Controlled attempt taken' : 'Target completed with control'} onPress={() => advance(true)} />
    <Action secondary title={showHelp ? 'Hide target help' : 'Cannot reach this target?'} onPress={() => setShowHelp(value => !value)} />
    {showHelp && <Card><Heading small>Keep practicing, not grinding</Heading><Body>{lesson.plateau}</Body>
      <Body>If you used assistance for a strict target, choose “Target unmet / skip this set” below. You can still finish useful practice without unlocking the next lesson.</Body></Card>}
    <Action secondary title="Target unmet / skip this set" onPress={() => advance(false)} />
    <Action secondary title="End early and record practice" onPress={stopEarly} />
  </Page>;
}
