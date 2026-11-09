import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { ALL_LESSONS, EMPTY_PLACEMENT, getPlacement, TRACK_NODES, type PlacementAnswers } from '@/constants/track';
import { Action, Card, Page, Body, Heading } from '@/components/TrainingUI';

export default function Onboarding() {
  const colors = useColors();
  const { state, completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<PlacementAnswers>({ ...EMPTY_PLACEMENT });
  const [earlierId, setEarlierId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const placement = getPlacement(answers, earlierId);
  const recommended = getPlacement(answers);
  const toggle = (key: keyof Omit<PlacementAnswers, 'pullUps'>, label: string) => (
    <Pressable testID={`placement-${key}`} accessibilityRole="checkbox" accessibilityState={{ checked: answers[key] }}
      onPress={() => { setAnswers(prev => ({ ...prev, [key]: !prev[key] })); setEarlierId(undefined); }}
      style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 12 }}>
      <Ionicons name={answers[key] ? 'checkbox' : 'square-outline'} color={colors.primary} size={24} />
      <Text style={{ flex: 1, color: colors.foreground, fontSize: 15, lineHeight: 23 }}>{label}</Text>
    </Pressable>
  );
  if (state.loading) return null;
  if (state.onboardingComplete) return <Redirect href="/(tabs)" />;
  const begin = async () => {
    if (busy) return;
    setBusy(true);
    try { await completeOnboarding(answers, placement.entry.lesson.id); router.replace('/(tabs)'); }
    catch (e) { setError(`Could not save placement: ${String(e)}`); setBusy(false); }
  };
  return <Page>
    <Ionicons name="barbell-outline" size={64} color={colors.primary} />
    <Heading>{step === 0 ? 'Your first controlled bar muscle-up' : 'Choose a conservative start'}</Heading>
    {step === 0 ? <>
      <Body>{TRACK_NODES.length} phases · small steps · your pace</Body>
      <Body>Guided workouts to build your pull, push and transition.</Body>
      <Card><Body>Repeat when needed. Rest between hard sessions.</Body></Card>
      <Action title="Find my starting point" onPress={() => setStep(1)} />
    </> : <>
      <Body>How many clean strict pull-ups can you do in one set? Count full controlled reps without kicking. A max set does not prove multiple work sets or other skills.</Body>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 32 }}>
        <Action title="−" label="Fewer pull-ups" onPress={() => { setAnswers(a => ({ ...a, pullUps: Math.max(0, a.pullUps - 1) })); setEarlierId(undefined); }} />
        <Text style={{ color: colors.primary, fontSize: 48, fontFamily: 'Inter_700Bold' }}>{answers.pullUps}</Text>
        <Action title="+" label="More pull-ups" onPress={() => { setAnswers(a => ({ ...a, pullUps: Math.min(50, a.pullUps + 1) })); setEarlierId(undefined); }} />
      </View>
      {answers.pullUps >= 5 && <Card>
        <Body>Only select skills you have already performed recently with control. Leave unsure answers unchecked.</Body>
        {toggle('repeatableFives', 'I can repeat 5 / 5 / 5 strict pull-ups with 3-minute rests, not just one max set.')}
        {answers.repeatableFives && toggle('supportAndDips', 'I can safely access a straight bar, hold unassisted support for 10 seconds and perform controlled straight-bar dips at 2 / 2.')}
        {answers.repeatableFives && answers.supportAndDips && answers.pullUps >= 8 && toggle('repeatableEights', 'I can also repeat 8 / 8 / 8 strict pull-ups with 3-minute rests, not just one set of eight.')}
        {answers.repeatableFives && answers.supportAndDips && answers.pullUps >= 8 && answers.repeatableEights && toggle('higherPulls', 'I have performed three controlled chest-to-bar singles and three higher-pull singles with full recovery.')}
        {answers.repeatableFives && answers.supportAndDips && answers.pullUps >= 8 && answers.repeatableEights && answers.higherPulls && toggle('assistedTransition', 'I can turn over both arms together and repeat two controlled bar muscle-up singles with light band assistance.')}
        {answers.repeatableFives && !answers.repeatableEights && <Body>Three sets of five let you start learning support and dips. This phase also guides pulling strength upward; a dip or one max pull-up set does not skip that work.</Body>}
      </Card>}
      <Card>
        <Heading small>Starting at: {placement.entry.node.title}</Heading>
        <Body>{placement.entry.lesson.title}</Body>
        {placement.entry.lesson.exercises.map(ex => <Body key={ex.id}>{ex.name}: {ex.targets.join(' / ')} {ex.unit}</Body>)}
        <Body>{placement.assessedLessonIds.length} earlier lessons assessed for placement only. No workout sessions or completed-lesson awards are created.</Body>
      </Card>
      {recommended.index > 0 && <Card>
        <Heading small>Prefer an earlier start?</Heading>
        <Body>Choose any earlier lesson. It is fine to begin with grip and control.</Body>
        {ALL_LESSONS.slice(0, recommended.index + 1).filter((l, i) =>
          i === 0 || l.id === recommended.entry.lesson.id || TRACK_NODES.some(n => n.lessons[0]?.id === l.id)
        ).map(l => <Action key={l.id} secondary title={`${placement.entry.lesson.id === l.id ? '✓ ' : ''}${l.title}`} onPress={() => setEarlierId(l.id)} />)}
        {placement.index > 0 && <Action secondary title="One lesson earlier" onPress={() => setEarlierId(ALL_LESSONS[placement.index - 1]!.id)} />}
      </Card>}
      {!!error && <Body>{error}</Body>}
      <Action title={busy ? 'Saving…' : 'Begin at this lesson'} onPress={begin} disabled={busy} />
      <Action secondary title="Back" onPress={() => setStep(0)} />
    </>}
  </Page>;
}
