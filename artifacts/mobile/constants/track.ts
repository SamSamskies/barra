export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number | string;
  restSeconds: number;
  description: string;
}

export interface Lesson {
  id: string;
  title: string;
  exercises: Exercise[];
  xpReward: number;
}

export interface TrackNode {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  nodeColor: string;
  lessons: Lesson[];
}

export const TRACK_NODES: TrackNode[] = [
  {
    id: 'foundation',
    title: 'Foundation',
    subtitle: 'Build your pull-up base',
    icon: 'barbell-outline',
    nodeColor: '#4ADE80',
    lessons: [
      {
        id: 'foundation-1',
        title: 'First Rep',
        xpReward: 100,
        exercises: [
          { id: 'f1e1', name: 'Pull-ups', sets: 3, reps: 6, restSeconds: 90, description: 'Full dead hang to chin over bar. Control the descent — 2 seconds down.' },
          { id: 'f1e2', name: 'Dead Hang', sets: 3, reps: '20s', restSeconds: 45, description: 'Hang with arms fully extended. Retract your shoulder blades slightly.' },
          { id: 'f1e3', name: 'Hollow Body Hold', sets: 2, reps: '20s', restSeconds: 45, description: 'Lie on back, press lower back to floor. Arms overhead, legs raised to 30 degrees.' },
        ],
      },
      {
        id: 'foundation-2',
        title: 'Building Volume',
        xpReward: 100,
        exercises: [
          { id: 'f2e1', name: 'Pull-ups', sets: 3, reps: 8, restSeconds: 90, description: 'Full range of motion. Initiate with your lats, not your arms.' },
          { id: 'f2e2', name: 'Dead Hang', sets: 3, reps: '30s', restSeconds: 45, description: 'Build grip and shoulder endurance. Breathe steadily.' },
          { id: 'f2e3', name: 'Scapular Pull-ups', sets: 3, reps: 8, restSeconds: 60, description: 'Arms stay straight. Retract and depress shoulder blades to lift body slightly.' },
        ],
      },
      {
        id: 'foundation-3',
        title: 'Strength Surge',
        xpReward: 150,
        exercises: [
          { id: 'f3e1', name: 'Pull-ups', sets: 3, reps: 6, restSeconds: 90, description: 'Full range, controlled descent. Stop 2–3 reps before failure — quality over quantity.' },
          { id: 'f3e2', name: 'Chin-ups', sets: 2, reps: 6, restSeconds: 90, description: 'Underhand grip, shoulder-width. Targets biceps and lower lats powerfully.' },
          { id: 'f3e3', name: 'Scapular Pull-ups', sets: 3, reps: 8, restSeconds: 60, description: 'Critical for muscle-up prep. Arms stay straight — pure shoulder blade movement.' },
        ],
      },
      {
        id: 'foundation-4',
        title: 'Max Strength',
        xpReward: 150,
        exercises: [
          { id: 'f4e1', name: 'Pull-ups', sets: 4, reps: 8, restSeconds: 90, description: 'Building volume gradually. Full recovery between sets matters here.' },
          { id: 'f4e2', name: 'Hollow Body Hold', sets: 3, reps: '30s', restSeconds: 45, description: 'Body tension is the bridge between pull and push in a muscle-up.' },
          { id: 'f4e3', name: 'Dead Hang', sets: 3, reps: '45s', restSeconds: 45, description: 'Iron grip. This transfers directly to muscle-up execution.' },
        ],
      },
    ],
  },
  {
    id: 'strength-base',
    title: 'Strength Base',
    subtitle: 'Scapular mastery',
    icon: 'body-outline',
    nodeColor: '#60A5FA',
    lessons: [
      {
        id: 'strength-1',
        title: 'Scapular Power',
        xpReward: 150,
        exercises: [
          { id: 's1e1', name: 'Scapular Pull-ups', sets: 4, reps: 12, restSeconds: 60, description: 'Protract fully, then retract and depress. No elbow bend. Pure scapular control.' },
          { id: 's1e2', name: 'Dead Hang', sets: 4, reps: '45s', restSeconds: 45, description: 'Serious grip and shoulder endurance. Every second is strength.' },
          { id: 's1e3', name: 'Pull-ups', sets: 3, reps: 10, restSeconds: 90, description: 'Maintain your pull-up quality while adding new skills.' },
        ],
      },
      {
        id: 'strength-2',
        title: 'Deep Pull',
        xpReward: 150,
        exercises: [
          { id: 's2e1', name: 'Chest-to-Bar Pull-ups', sets: 3, reps: 5, restSeconds: 90, description: 'Pull until your chest touches the bar. This range of motion is non-negotiable for muscle-ups.' },
          { id: 's2e2', name: 'Scapular Pull-ups', sets: 4, reps: 12, restSeconds: 60, description: 'Engrain the scapular movement. It is the foundation of the transition.' },
          { id: 's2e3', name: 'Hanging Leg Raise', sets: 3, reps: 10, restSeconds: 60, description: 'Hip flexor and core strength for bar path control.' },
        ],
      },
      {
        id: 'strength-3',
        title: 'Bar Control',
        xpReward: 200,
        exercises: [
          { id: 's3e1', name: 'Chest-to-Bar Pull-ups', sets: 4, reps: 6, restSeconds: 90, description: 'Chest contact every rep. Be deliberate and powerful.' },
          { id: 's3e2', name: 'Dead Hang', sets: 4, reps: '1min', restSeconds: 45, description: 'One full minute. Your grip will become a weapon.' },
          { id: 's3e3', name: 'Hollow Body Hold', sets: 3, reps: '40s', restSeconds: 45, description: 'Strengthen the core link between your pull and your push.' },
        ],
      },
    ],
  },
  {
    id: 'power-up',
    title: 'Power Up',
    subtitle: 'Explosive force',
    icon: 'flash-outline',
    nodeColor: '#F59E0B',
    lessons: [
      {
        id: 'power-1',
        title: 'Explosive Pull',
        xpReward: 200,
        exercises: [
          { id: 'p1e1', name: 'Explosive Pull-ups', sets: 4, reps: 5, restSeconds: 120, description: 'Maximum velocity from dead hang. Drive elbows to hips. Each rep is an all-out effort.' },
          { id: 'p1e2', name: 'High Pull-ups', sets: 3, reps: 5, restSeconds: 120, description: 'Aim to get your navel to bar height. Explosiveness is the key.' },
          { id: 'p1e3', name: 'Chest-to-Bar Pull-ups', sets: 3, reps: 5, restSeconds: 90, description: 'Maintain chest-to-bar contact. Speed and precision.' },
        ],
      },
      {
        id: 'power-2',
        title: 'Height Seeker',
        xpReward: 200,
        exercises: [
          { id: 'p2e1', name: 'High Pull-ups', sets: 4, reps: 6, restSeconds: 120, description: 'Hips to bar. Lean back slightly at the top to help generate height.' },
          { id: 'p2e2', name: 'Explosive Pull-ups', sets: 4, reps: 6, restSeconds: 120, description: 'Focus on speed in the first third of the movement.' },
          { id: 'p2e3', name: 'Hollow Body Swings', sets: 3, reps: '30s', restSeconds: 60, description: 'Controlled swing with rigid body tension. Builds the kip foundation.' },
        ],
      },
      {
        id: 'power-3',
        title: 'Hip Drive',
        xpReward: 250,
        exercises: [
          { id: 'p3e1', name: 'Hip Drive Drill', sets: 4, reps: 5, restSeconds: 120, description: 'From dead hang, drive hips explosively upward toward the bar. Big momentum.' },
          { id: 'p3e2', name: 'High Pull-ups', sets: 4, reps: 7, restSeconds: 120, description: 'Higher every session. Your ceiling is rising.' },
          { id: 'p3e3', name: 'Explosive Pull-ups', sets: 3, reps: 7, restSeconds: 90, description: 'Max speed, then controlled descent. Quality over quantity.' },
        ],
      },
    ],
  },
  {
    id: 'archer',
    title: 'Archer',
    subtitle: 'One-arm strength',
    icon: 'arrow-up-circle-outline',
    nodeColor: '#A78BFA',
    lessons: [
      {
        id: 'archer-1',
        title: 'First Arrow',
        xpReward: 250,
        exercises: [
          { id: 'a1e1', name: 'Assisted Archer Pull-ups', sets: 4, reps: 5, restSeconds: 120, description: 'One arm bends while the other extends straight to the side. Use the extended arm for light assistance only.' },
          { id: 'a1e2', name: 'Explosive Pull-ups', sets: 3, reps: 6, restSeconds: 90, description: 'Keep the explosive power base sharp.' },
          { id: 'a1e3', name: 'L-sit Hang', sets: 3, reps: '20s', restSeconds: 60, description: 'Legs parallel to ground while hanging. Core and hip flexor endurance.' },
        ],
      },
      {
        id: 'archer-2',
        title: 'True Archer',
        xpReward: 250,
        exercises: [
          { id: 'a2e1', name: 'Archer Pull-ups', sets: 4, reps: 4, restSeconds: 120, description: 'Both sides equally. The extended arm is straight and provides minimal support.' },
          { id: 'a2e2', name: 'Assisted Archer Pull-ups', sets: 2, reps: 6, restSeconds: 90, description: 'Extra volume with slight assistance for endurance.' },
          { id: 'a2e3', name: 'High Pull-ups', sets: 3, reps: 6, restSeconds: 90, description: 'Explosive pulling power is your foundation.' },
        ],
      },
      {
        id: 'archer-3',
        title: 'Iron Arm',
        xpReward: 300,
        exercises: [
          { id: 'a3e1', name: 'Archer Pull-ups', sets: 5, reps: 5, restSeconds: 120, description: 'No assistance. Pure unilateral power on each side.' },
          { id: 'a3e2', name: 'Slow Negatives', sets: 3, reps: 5, restSeconds: 90, description: '5-second controlled descent. Maximum time under tension.' },
          { id: 'a3e3', name: 'High Pull-ups', sets: 3, reps: 7, restSeconds: 90, description: 'Explosive pulling fuel for muscle-up readiness.' },
        ],
      },
    ],
  },
  {
    id: 'negative',
    title: 'Negatives',
    subtitle: 'Transition training',
    icon: 'trending-down-outline',
    nodeColor: '#FB923C',
    lessons: [
      {
        id: 'negative-1',
        title: 'First Negative',
        xpReward: 300,
        exercises: [
          { id: 'n1e1', name: 'Negative Muscle-ups', sets: 3, reps: 4, restSeconds: 120, description: 'Jump or step to the top position. Lower yourself slowly through the full transition — 5 seconds down.' },
          { id: 'n1e2', name: 'Archer Pull-ups', sets: 3, reps: 5, restSeconds: 120, description: 'Maintain your unilateral pulling strength.' },
          { id: 'n1e3', name: 'Dip Negatives', sets: 3, reps: 8, restSeconds: 90, description: '5-second descent on dips. Builds the push strength you need at the top of a muscle-up.' },
        ],
      },
      {
        id: 'negative-2',
        title: 'Slow Control',
        xpReward: 300,
        exercises: [
          { id: 'n2e1', name: 'Negative Muscle-ups', sets: 4, reps: 5, restSeconds: 120, description: 'Control every inch. Aim for 7 full seconds through the transition zone.' },
          { id: 'n2e2', name: 'High Pull-ups', sets: 3, reps: 7, restSeconds: 90, description: 'The explosive pulling power must stay sharp.' },
          { id: 'n2e3', name: 'Ring Dips', sets: 3, reps: 8, restSeconds: 90, description: 'Full range ring dips build the instability strength needed on rings.' },
        ],
      },
      {
        id: 'negative-3',
        title: 'Gravity Defier',
        xpReward: 350,
        exercises: [
          { id: 'n3e1', name: 'Negative Muscle-ups', sets: 5, reps: 5, restSeconds: 120, description: 'Maximum control. 7-10 second descent. You are writing the movement into your nervous system.' },
          { id: 'n3e2', name: 'Archer Pull-ups', sets: 3, reps: 6, restSeconds: 120, description: 'One-arm strength for the pull phase of the muscle-up.' },
          { id: 'n3e3', name: 'Parallel Bar Dips', sets: 4, reps: 10, restSeconds: 90, description: 'Explosive push. This is your top position lockout strength.' },
        ],
      },
    ],
  },
  {
    id: 'transition',
    title: 'Transition',
    subtitle: 'The breakthrough',
    icon: 'shuffle-outline',
    nodeColor: '#F43F5E',
    lessons: [
      {
        id: 'transition-1',
        title: 'Banded Assist',
        xpReward: 350,
        exercises: [
          { id: 't1e1', name: 'Banded Muscle-ups', sets: 4, reps: 5, restSeconds: 120, description: 'Loop a resistance band around the bar and your hips. Focus entirely on the transition pattern — pull to push.' },
          { id: 't1e2', name: 'Negative Muscle-ups', sets: 3, reps: 5, restSeconds: 120, description: 'Reinforce the exact path of the transition.' },
          { id: 't1e3', name: 'Explosive Pull-ups', sets: 3, reps: 7, restSeconds: 90, description: 'Explosiveness is what gets you over the bar.' },
        ],
      },
      {
        id: 'transition-2',
        title: 'Wrist Turnover',
        xpReward: 400,
        exercises: [
          { id: 't2e1', name: 'Banded Muscle-ups', sets: 3, reps: 6, restSeconds: 120, description: 'Reduce band assistance. The movement should feel familiar now.' },
          { id: 't2e2', name: 'Transition Practice', sets: 5, reps: 3, restSeconds: 90, description: 'From chin-over-bar position, practice the wrist turnover into the dip position. This is the muscle-up in slow motion.' },
          { id: 't2e3', name: 'Ring Dips', sets: 4, reps: 10, restSeconds: 90, description: 'Lock out the top position with authority.' },
        ],
      },
      {
        id: 'transition-3',
        title: 'Unleashed',
        xpReward: 450,
        exercises: [
          { id: 't3e1', name: 'Muscle-up Attempts', sets: 5, reps: 3, restSeconds: 180, description: 'Give everything. Explosive pull, fast wrist turnover, strong lockout. Today you may get your first rep.' },
          { id: 't3e2', name: 'Banded Muscle-ups', sets: 3, reps: 5, restSeconds: 120, description: 'Supplement with banded reps for confidence and volume.' },
          { id: 't3e3', name: 'Negative Muscle-ups', sets: 3, reps: 5, restSeconds: 120, description: 'Reinforce the pattern after your attempts.' },
        ],
      },
    ],
  },
  {
    id: 'muscle-up',
    title: 'Muscle-up',
    subtitle: 'The summit',
    icon: 'trophy-outline',
    nodeColor: '#FF5722',
    lessons: [
      {
        id: 'muscleup-1',
        title: 'First Muscle-up',
        xpReward: 500,
        exercises: [
          { id: 'm1e1', name: 'Muscle-ups', sets: 3, reps: 2, restSeconds: 180, description: 'This is it. Explosive pull from dead hang, drive the transition, lock out at the top. You have earned this moment.' },
          { id: 'm1e2', name: 'Negative Muscle-ups', sets: 3, reps: 5, restSeconds: 120, description: 'Reinforce every rep with a perfect negative.' },
          { id: 'm1e3', name: 'Explosive Pull-ups', sets: 3, reps: 7, restSeconds: 90, description: 'Warm-up and confidence building before the main event.' },
        ],
      },
      {
        id: 'muscleup-2',
        title: 'Muscle-up Mastery',
        xpReward: 600,
        exercises: [
          { id: 'm2e1', name: 'Muscle-ups', sets: 4, reps: 5, restSeconds: 180, description: "You've arrived. String them together. Each rep cleaner and more powerful than the last." },
          { id: 'm2e2', name: 'Weighted Pull-ups', sets: 3, reps: 6, restSeconds: 120, description: 'Extra resistance builds strength for effortless unweighted muscle-ups.' },
          { id: 'm2e3', name: 'Ring Muscle-ups', sets: 3, reps: 3, restSeconds: 180, description: 'The ultimate progression. Rings demand superior strength, stability, and technique.' },
        ],
      },
    ],
  },
];

export const getNextLesson = (completedIds: string[]): { lesson: Lesson; node: TrackNode } | null => {
  for (const node of TRACK_NODES) {
    for (const lesson of node.lessons) {
      if (!completedIds.includes(lesson.id)) {
        return { lesson, node };
      }
    }
  }
  return null;
};

export const getLessonById = (id: string): { lesson: Lesson; node: TrackNode } | null => {
  for (const node of TRACK_NODES) {
    for (const lesson of node.lessons) {
      if (lesson.id === id) {
        return { lesson, node };
      }
    }
  }
  return null;
};

export const getNodeProgress = (nodeId: string, completedIds: string[]): { completed: number; total: number } => {
  const node = TRACK_NODES.find(n => n.id === nodeId);
  if (!node) return { completed: 0, total: 0 };
  const completed = node.lessons.filter(l => completedIds.includes(l.id)).length;
  return { completed, total: node.lessons.length };
};

export const getNodeStatus = (nodeId: string, completedIds: string[]): 'completed' | 'active' | 'locked' => {
  const nodeIdx = TRACK_NODES.findIndex(n => n.id === nodeId);
  if (nodeIdx === -1) return 'locked';

  const node = TRACK_NODES[nodeIdx];
  const allCompleted = node.lessons.every(l => completedIds.includes(l.id));
  if (allCompleted) return 'completed';

  if (nodeIdx === 0) return 'active';
  const prevNode = TRACK_NODES[nodeIdx - 1];
  const prevComplete = prevNode.lessons.every(l => completedIds.includes(l.id));
  if (prevComplete) return 'active';

  return 'locked';
};

export const getStartingCompletedLessons = (pullUps: number): string[] => {
  if (pullUps <= 5) return [];
  if (pullUps <= 9) return ['foundation-1'];
  if (pullUps <= 12) return ['foundation-1', 'foundation-2'];
  return ['foundation-1', 'foundation-2', 'foundation-3'];
};

export const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 1800, 2800, 4200, 6000, 8500, 12000];

export const getLevelInfo = (xp: number): { level: number; progress: number; nextXP: number } => {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }

  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]!;
  const range = nextThreshold - currentThreshold;
  const progress = range > 0 ? (xp - currentThreshold) / range : 1;

  return { level, progress: Math.min(Math.max(progress, 0), 1), nextXP: nextThreshold };
};
