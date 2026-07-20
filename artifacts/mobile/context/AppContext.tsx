import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getStartingCompletedLessons } from '@/constants/track';

export interface WorkoutRecord {
  lessonId: string;
  completedAt: string;
}

export interface AppState {
  onboardingComplete: boolean;
  initialPullUps: number;
  streak: number;
  lastWorkoutDate: string | null;
  completedLessonIds: string[];
  workoutHistory: WorkoutRecord[];
  loading: boolean;
}

interface AppContextType {
  state: AppState;
  completeOnboarding: (pullUps: number) => Promise<void>;
  completeLesson: (lessonId: string) => Promise<void>;
  resetProgress: () => Promise<void>;
}

const STORAGE_KEY = '@calisthenx_v1';

const defaultState: AppState = {
  onboardingComplete: false,
  initialPullUps: 0,
  streak: 0,
  lastWorkoutDate: null,
  completedLessonIds: [],
  workoutHistory: [],
  loading: true,
};

const AppContext = createContext<AppContextType | null>(null);

const isSameDay = (a: string, b: string) => {
  return new Date(a).toDateString() === new Date(b).toDateString();
};

const isYesterday = (dateStr: string) => {
  const d = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.toDateString() === yesterday.toDateString();
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<AppState>;
          setState({ ...defaultState, ...parsed, loading: false });
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch {
        setState(prev => ({ ...prev, loading: false }));
      }
    })();
  }, []);

  const persist = useCallback(async (next: AppState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...next, loading: false }));
    } catch {
      // silent
    }
  }, []);

  const completeOnboarding = useCallback(async (pullUps: number) => {
    const startingLessons = getStartingCompletedLessons(pullUps);
    setState(prev => {
      const next: AppState = {
        ...prev,
        onboardingComplete: true,
        initialPullUps: pullUps,
        completedLessonIds: startingLessons,
        loading: false,
      };
      persist(next);
      return next;
    });
  }, [persist]);

  const completeLesson = useCallback(async (lessonId: string) => {
    setState(prev => {
      if (prev.completedLessonIds.includes(lessonId)) return prev;

      const today = new Date().toISOString();
      let newStreak = prev.streak;

      if (!prev.lastWorkoutDate) {
        newStreak = 1;
      } else if (isSameDay(prev.lastWorkoutDate, today)) {
        // already worked out today
      } else if (isYesterday(prev.lastWorkoutDate)) {
        newStreak = prev.streak + 1;
      } else {
        newStreak = 1;
      }

      const record: WorkoutRecord = { lessonId, completedAt: today };

      const next: AppState = {
        ...prev,
        completedLessonIds: [...prev.completedLessonIds, lessonId],
        streak: newStreak,
        lastWorkoutDate: today,
        workoutHistory: [record, ...prev.workoutHistory].slice(0, 50),
        loading: false,
      };
      persist(next);
      return next;
    });
  }, [persist]);

  const resetProgress = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // silent
    }
    setState({ ...defaultState, loading: false });
  }, []);

  return (
    <AppContext.Provider value={{ state, completeOnboarding, completeLesson, resetProgress }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
