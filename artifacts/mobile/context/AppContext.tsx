import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { type PlacementAnswers } from '@/constants/track';
import { freshState, loadProgress, placeUser, recordSession, STORAGE_KEY, undoCredit, type ProgressState, type SessionInput } from '@/lib/progression';

export type { WorkoutRecord } from '@/lib/progression';
export type AppState = ProgressState & { loading: boolean };
interface AppContextType {
  state: AppState;
  completeOnboarding: (answers: PlacementAnswers, entryId?: string) => Promise<void>;
  saveSession: (input: SessionInput) => Promise<void>;
  uncompleteLesson: (lessonId: string) => Promise<void>;
  resetProgress: () => Promise<void>;
}
const AppContext = createContext<AppContextType | null>(null);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({ ...freshState(), loading: true });
  const [error, setError] = useState<string | null>(null);
  const current = useRef(state);
  const queue = useRef(Promise.resolve());
  const load = useCallback(async () => {
    try {
      const saved = await loadProgress(AsyncStorage);
      current.current = { ...saved, loading: false };
      setState(current.current);
      setError(null);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load local progress.'); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const update = useCallback((transform: (prev: ProgressState) => ProgressState) => {
    const operation = queue.current.then(async () => {
      const next = { ...transform(current.current), loading: false };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      current.current = next;
      setState(next);
      setError(null);
    });
    queue.current = operation.catch(() => {});
    return operation;
  }, []);
  const completeOnboarding = useCallback((answers: PlacementAnswers, entryId?: string) => update(prev => placeUser(prev, answers, entryId)), [update]);
  const saveSession = useCallback((input: SessionInput) => update(prev => recordSession(prev, input)), [update]);
  const uncompleteLesson = useCallback((id: string) => update(prev => undoCredit(prev, id)), [update]);
  const resetProgress = useCallback(() => update(() => freshState()), [update]);
  if (error) {
    return <View style={{ flex: 1, backgroundColor: '#16171D', padding: 32, justifyContent: 'center', gap: 24 }}>
      <Text style={{ color: 'white' }}>{error}</Text>
      <Pressable onPress={load}><Text style={{ color: '#4ADE80' }}>Retry loading</Text></Pressable>
      <Pressable onPress={() => resetProgress().catch(e => setError(String(e)))}><Text style={{ color: '#F59E0B' }}>Clear unreadable local progress and restart</Text></Pressable>
    </View>;
  }
  return <AppContext.Provider value={{ state, completeOnboarding, saveSession, uncompleteLesson, resetProgress }}>{children}</AppContext.Provider>;
}
export const useApp = () => {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
};
