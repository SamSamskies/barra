import type { Exercise, Lesson } from './track';

export const STOP_CUE = 'Stop for pain or loss of control.';
export const SETUP_CUE = 'Use secure, load-rated equipment, clear space above/below the bar, and warm up.';
export const PLATFORM_CUE = 'Use a safe stable platform to step up and down; no blind jumps or unstable furniture. No safe access? Do not start.';

// Presentation only: prescriptions and progression remain in track/progression.
const cues: Record<string, string> = {
  'Supported Hang': 'Keep feet supported; unload your grip and stop before it slips.',
  'Supported Scapular Pull-ups': 'Feet supported, elbows straight. Move gently through the shoulder blades; never force range.',
  'Assisted Pull-ups': 'Use enough assistance for control from long arms to chin over bar. Keep assistance fixed.',
  'Strict Pull-ups': 'No kicking or grinding. Assistance or a shortened set means unmet, not a strict rep.',
  'Supported Straight-Bar Support': 'Keep feet loaded, elbows straight and shoulders steady.',
  'Straight-Bar Support': 'Lift feet only when steady. Keep the platform ready for a controlled exit.',
  'Assisted Straight-Bar Dips': 'Feet unload the dip. Keep assistance and comfortable depth fixed; no forced range.',
  'Straight-Bar Dips': 'Use the single straight bar. No bounce or forced depth; finish in steady support.',
  'Assisted Chest-to-Bar Pull-ups': 'Use enough assistance for chest height without kicking; keep assistance fixed.',
  'Chest-to-Bar Pull-ups': 'Start still. If chest height is lost, stop and log assisted practice.',
  'Higher Pulls': 'No large swing. Stop when speed or height drops; use only height you control.',
  'Feet-Supported Bar Turnover': 'Use a low bar with feet secure and legs carrying most weight. Turn both wrists together; no one-arm turnover.',
  'Band-Assisted Bar Muscle-ups': 'Inspect and secure the band; learn safe platform entry before loading. Both elbows turn together. No improvised straps or jump starts.',
  'Controlled Muscle-Up Attempts': 'One fresh, fully rested attempt. Both arms turn together; stop failures safely, never grind. An attempt is not success.',
  'Controlled Bar Muscle-ups': 'Controlled hang to steady straight-arm support, both arms together. No large kip or one-arm turnover. A failed attempt is not a rep.',
};
export function movementCue(exercise: Exercise): string {
  const cue = cues[exercise.name];
  if (!cue) throw new Error(`Missing visible safety cue: ${exercise.name}`);
  return cue;
}
export const needsPlatform = (exercise: Exercise) => exercise.equipment.some(item => /platform/i.test(item));
export const focusSummary = (lesson: Lesson) => lesson.change.split(/(?<=\.)\s/)[0]!;
export function practiceCue(lesson: Lesson): string {
  if (lesson.exercises.some(ex => ex.unit === 'attempts') || lesson.requiresSuccess)
    return 'Keep attempts few and fully rested. Retry after recovery or revisit assisted transitions; do not add failed attempts.';
  if (lesson.exercises.some(ex => ex.name.includes('Chest-to-Bar') || ex.name === 'Higher Pulls'))
    return 'If height or speed fades, stop skill work. Keep supporting targets fixed; mark missed or assisted strict sets unmet.';
  return 'Repeat after recovery. Use more assistance if needed, not extra sets; mark missed, substituted or shortened sets unmet.';
}
