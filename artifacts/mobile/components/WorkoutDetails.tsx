import React from 'react';
import { Linking } from 'react-native';
import { type Exercise } from '@/constants/track';
import { EXERCISE_DEMOS } from '@/constants/demos';
import { Action, Body, Card, Disclosure } from './TrainingUI';

export function ExerciseDetails({ exercise }: { exercise: Exercise }) {
  return <Disclosure title={`Form & demo: ${exercise.name}`}>
    <Card>
      <Body>{exercise.description}</Body>
      <Body>Equipment: {exercise.equipment.join(' · ')}</Body>
      {exercise.variation !== 'standard' && <Body>Setup: {exercise.variation}. Repeat before changing assistance again.</Body>}
      <Action secondary title={`Find a demo: ${exercise.name}`} onPress={() => { void Linking.openURL(EXERCISE_DEMOS[exercise.name]!); }} />
    </Card>
  </Disclosure>;
}
