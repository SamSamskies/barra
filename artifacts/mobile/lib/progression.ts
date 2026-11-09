import { ALL_LESSONS, canStartLesson, getLessonById, getPlacement, type PlacementAnswers } from '../constants/track';

export const STORAGE_KEY = '@calisthenx_bar_v3';
export const LEGACY_STORAGE_KEY = '@calisthenx_v1';
export const PREVIOUS_STORAGE_KEY = '@calisthenx_bar_v2';
export interface WorkoutRecord {
  id: string;
  lessonId: string;
  completedAt: string;
  outcome: 'practice' | 'mastered' | 'repeat';
  skippedSets: number;
  targetsMet: boolean;
  actualSuccess: boolean;
}
export interface ProgressState {
  version: 3;
  onboardingComplete: boolean;
  rebuildNotice: boolean;
  initialPullUps: number;
  streak: number;
  lastWorkoutDate: string | null;
  completedLessonIds: string[];
  assessedLessonIds: string[];
  workoutHistory: WorkoutRecord[];
}
export const freshState = (rebuildNotice = false): ProgressState => ({
  version: 3, onboardingComplete: false, rebuildNotice, initialPullUps: 0,
  streak: 0, lastWorkoutDate: null, completedLessonIds: [], assessedLessonIds: [], workoutHistory: [],
});
export const creditedIds = (state: ProgressState) => [...new Set([...state.assessedLessonIds, ...state.completedLessonIds])];
export function placeUser(state: ProgressState, answers: PlacementAnswers, entryId?: string): ProgressState {
  if (state.onboardingComplete) throw new Error('Reset progress before changing placement.');
  return { ...state, onboardingComplete: true, rebuildNotice: false, initialPullUps: answers.pullUps,
    assessedLessonIds: getPlacement(answers, entryId).assessedLessonIds };
}
export interface SessionInput {
  id: string;
  lessonId: string;
  skippedSets: number;
  targetsMet: boolean;
  ready: boolean;
  actualSuccess: boolean;
}
export function recordSession(state: ProgressState, input: SessionInput, now = new Date()): ProgressState {
  if (state.workoutHistory.some(s => s.id === input.id)) return state;
  const found = getLessonById(input.lessonId);
  if (!state.onboardingComplete || !found || !canStartLesson(input.lessonId, creditedIds(state))) throw new Error('This lesson is locked. Complete earlier steps first.');
  const mastery = input.skippedSets === 0 && input.targetsMet && input.ready && (!found.lesson.requiresSuccess || input.actualSuccess);
  const alreadyCredited = creditedIds(state).includes(input.lessonId);
  const outcome = !mastery ? 'practice' : alreadyCredited ? 'repeat' : 'mastered';
  const today = now.toISOString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  let streak = state.streak;
  if (!state.lastWorkoutDate) streak = 1;
  else if (new Date(state.lastWorkoutDate).toDateString() !== now.toDateString()) {
    streak = new Date(state.lastWorkoutDate).toDateString() === yesterday.toDateString() ? streak + 1 : 1;
  }
  return { ...state, streak, lastWorkoutDate: today,
    completedLessonIds: mastery && !state.completedLessonIds.includes(input.lessonId)
      ? [...state.completedLessonIds, input.lessonId] : state.completedLessonIds,
    workoutHistory: [{ id: input.id, lessonId: input.lessonId, completedAt: today, outcome,
      skippedSets: input.skippedSets, targetsMet: input.targetsMet, actualSuccess: input.actualSuccess }, ...state.workoutHistory],
  };
}
// Revoke credit from this point onward to preserve prerequisite ordering.
// Real sessions are immutable history, including successful repeats.
export function undoCredit(state: ProgressState, lessonId: string): ProgressState {
  const index = ALL_LESSONS.findIndex(l => l.id === lessonId);
  if (index < 0) return state;
  const earlier = new Set(ALL_LESSONS.slice(0, index).map(l => l.id));
  return { ...state, completedLessonIds: state.completedLessonIds.filter(id => earlier.has(id)),
    assessedLessonIds: state.assessedLessonIds.filter(id => earlier.has(id)) };
}
interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
export async function loadProgress(storage: Storage): Promise<ProgressState> {
  const saved = await storage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved) as ProgressState;
    if (parsed.version !== 3 || !Array.isArray(parsed.workoutHistory) || !Array.isArray(parsed.completedLessonIds) || !Array.isArray(parsed.assessedLessonIds)) {
      throw new Error('Saved progress could not be read. Reset local progress to start again.');
    }
    return parsed;
  }
  // Persist the new boundary before removing the old key. The notice survives
  // closing the app before fresh onboarding has finished.
  const legacy = await storage.getItem(LEGACY_STORAGE_KEY);
  const previous = await storage.getItem(PREVIOUS_STORAGE_KEY);
  const next = freshState(legacy !== null || previous !== null);
  await storage.setItem(STORAGE_KEY, JSON.stringify(next));
  await storage.removeItem(LEGACY_STORAGE_KEY);
  await storage.removeItem(PREVIOUS_STORAGE_KEY);
  return next;
}
