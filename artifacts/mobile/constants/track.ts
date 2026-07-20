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
  xpReward?: number;
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
        title: 'Ground Zero',
        xpReward: 100,
        exercises: [
          { id: 'f1e1', name: 'Band-Assisted Pull-ups', sets: 3, reps: 5, restSeconds: 60, description: 'Loop a resistance band over the bar and step in. Focus on full range: dead hang all the way to chin above bar.' },
          { id: 'f1e2', name: 'Negative Pull-ups', sets: 3, reps: 3, restSeconds: 90, description: 'Jump or step to chin-over-bar. Lower yourself as slowly as possible — aim for 3–5 seconds down. This builds strength faster than positives alone.' },
          { id: 'f1e3', name: 'Dead Hang', sets: 3, reps: '15s', restSeconds: 45, description: 'Hang with arms fully extended. Let your shoulder blades relax, then retract them slightly. Every second builds grip and shoulder stability.' },
        ],
      },
      {
        id: 'foundation-2',
        title: 'First Rep',
        xpReward: 100,
        exercises: [
          { id: 'f2e1', name: 'Pull-ups', sets: 2, reps: 2, restSeconds: 90, description: 'Quality over everything. Full dead hang to chin over bar — no half reps. Control the descent, 2 seconds down.' },
          { id: 'f2e2', name: 'Negative Pull-ups', sets: 3, reps: 3, restSeconds: 90, description: '5-second descent. Your muscles are strongest on the way down — use it.' },
          { id: 'f2e3', name: 'Dead Hang', sets: 3, reps: '20s', restSeconds: 45, description: 'Hang is getting longer. Breathe steadily and stay relaxed.' },
        ],
      },
      {
        id: 'foundation-3',
        title: 'Building Reps',
        xpReward: 100,
        exercises: [
          { id: 'f3e1', name: 'Pull-ups', sets: 3, reps: 3, restSeconds: 90, description: 'Three full sets now. Rest completely between sets — quality reps only.' },
          { id: 'f3e2', name: 'Dead Hang', sets: 3, reps: '25s', restSeconds: 45, description: 'Grip is building session by session.' },
          { id: 'f3e3', name: 'Scapular Pull-ups', sets: 3, reps: 8, restSeconds: 60, description: 'Arms stay perfectly straight — just retract and depress your shoulder blades to lift slightly. Essential muscle-up prep from day one.' },
        ],
      },
      {
        id: 'foundation-4',
        title: 'Steady Climb',
        xpReward: 100,
        exercises: [
          { id: 'f4e1', name: 'Pull-ups', sets: 3, reps: 4, restSeconds: 90, description: 'One more rep per set. Small steps are real steps — full range and a controlled descent every time.' },
          { id: 'f4e2', name: 'Dead Hang', sets: 3, reps: '28s', restSeconds: 45, description: 'Grip endurance creeping up. Hold steady.' },
          { id: 'f4e3', name: 'Scapular Pull-ups', sets: 3, reps: 10, restSeconds: 60, description: 'More reps, same perfect form. No elbow bend at all.' },
        ],
      },
      {
        id: 'foundation-5',
        title: 'Finding Volume',
        xpReward: 100,
        exercises: [
          { id: 'f5e1', name: 'Pull-ups', sets: 3, reps: 5, restSeconds: 90, description: 'Five per set. Take what you\'ve built and push it one step further. Full range, every rep.' },
          { id: 'f5e2', name: 'Dead Hang', sets: 3, reps: '30s', restSeconds: 45, description: '30 seconds — your grip is becoming serious.' },
          { id: 'f5e3', name: 'Scapular Pull-ups', sets: 3, reps: 12, restSeconds: 60, description: 'Mastering scapular control now pays off in every node ahead.' },
        ],
      },
      {
        id: 'foundation-6',
        title: 'Strong Sets',
        xpReward: 150,
        exercises: [
          { id: 'f6e1', name: 'Pull-ups', sets: 3, reps: 6, restSeconds: 90, description: 'Consistent, quality sixes across all three sets. Initiate with your lats, not your arms.' },
          { id: 'f6e2', name: 'Chin-ups', sets: 3, reps: 4, restSeconds: 90, description: 'Underhand grip, shoulder-width. Targets biceps and lower lats differently — a fresh stimulus alongside your pull-up volume.' },
          { id: 'f6e3', name: 'Hollow Body Hold', sets: 2, reps: '25s', restSeconds: 45, description: 'Lie on back, press lower back to floor. Arms overhead, legs raised. This core link becomes critical in the transition.' },
        ],
      },
      {
        id: 'foundation-7',
        title: 'Strength Surge',
        xpReward: 150,
        exercises: [
          { id: 'f7e1', name: 'Pull-ups', sets: 4, reps: 6, restSeconds: 90, description: 'One more set than last time — same reps, more total volume. This is how strength compounds.' },
          { id: 'f7e2', name: 'Chin-ups', sets: 3, reps: 5, restSeconds: 90, description: 'Continuing the chin-up build. Squeeze at the top, full hang at the bottom.' },
          { id: 'f7e3', name: 'Scapular Pull-ups', sets: 3, reps: 12, restSeconds: 60, description: 'Engrain this movement. It is the hidden foundation of every muscle-up.' },
        ],
      },
      {
        id: 'foundation-8',
        title: 'Power Seven',
        xpReward: 150,
        exercises: [
          { id: 'f8e1', name: 'Pull-ups', sets: 4, reps: 7, restSeconds: 90, description: 'Seven per set — one step before your peak. Full control, full range. You\'re ready for this.' },
          { id: 'f8e2', name: 'Chin-ups', sets: 3, reps: 6, restSeconds: 90, description: 'Underhand pulling strength keeps pace with your overhand volume.' },
          { id: 'f8e3', name: 'Dead Hang', sets: 3, reps: '40s', restSeconds: 45, description: 'Almost there on the hang too. Every second is earned.' },
        ],
      },
      {
        id: 'foundation-9',
        title: 'Max Strength',
        xpReward: 150,
        exercises: [
          { id: 'f9e1', name: 'Pull-ups', sets: 4, reps: 8, restSeconds: 90, description: 'Your pull-up peak in this phase. Full range, controlled descent on every rep. This is what you\'ve built toward.' },
          { id: 'f9e2', name: 'Chin-ups', sets: 3, reps: 6, restSeconds: 90, description: 'Underhand volume for balanced upper-body development.' },
          { id: 'f9e3', name: 'Dead Hang', sets: 3, reps: '45s', restSeconds: 45, description: 'Iron grip. This transfers directly to muscle-up execution.' },
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
  const all = (n: number) =>
    Array.from({ length: n }, (_, i) => `foundation-${i + 1}`);
  // Each tier skips lessons the user has clearly surpassed
  if (pullUps <= 0) return [];           // start at Ground Zero
  if (pullUps <= 2) return all(1);       // skip to First Rep
  if (pullUps <= 3) return all(2);       // skip to Building Reps
  if (pullUps <= 4) return all(3);       // skip to Steady Climb
  if (pullUps <= 5) return all(4);       // skip to Finding Volume
  if (pullUps <= 6) return all(5);       // skip to Strong Sets
  if (pullUps <= 8) return all(6);       // skip to Strength Surge
  if (pullUps <= 10) return all(7);      // skip to Power Seven
  if (pullUps <= 12) return all(8);      // skip to Max Strength
  return all(9);                         // Foundation complete → into Strength Base
};

export const getCurrentLevel = (completedIds: string[]): {
  level: number;
  node: TrackNode;
  lessonsComplete: number;
  lessonsTotal: number;
} => {
  for (let i = 0; i < TRACK_NODES.length; i++) {
    const node = TRACK_NODES[i]!;
    const done = node.lessons.filter(l => completedIds.includes(l.id)).length;
    if (done < node.lessons.length) {
      return { level: i + 1, node, lessonsComplete: done, lessonsTotal: node.lessons.length };
    }
  }
  const lastNode = TRACK_NODES[TRACK_NODES.length - 1]!;
  return { level: TRACK_NODES.length, node: lastNode, lessonsComplete: lastNode.lessons.length, lessonsTotal: lastNode.lessons.length };
};
