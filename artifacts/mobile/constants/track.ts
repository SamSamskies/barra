export interface Exercise {
  id: string;
  name: string;
  targets: number[];
  unit: 'reps' | 'seconds' | 'attempts';
  restSeconds: number;
  description: string;
  equipment: string[];
  variation: string;
}
export interface Lesson {
  id: string;
  title: string;
  exercises: Exercise[];
  change: string;
  readiness: string;
  focus: string;
  plateau: string;
  requiresSuccess?: boolean;
}
export interface TrackNode {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  nodeColor: string;
  lessons: Lesson[];
}

export const RECOVERY_GUIDANCE = 'Repeat a step as often as needed. Leave recovery days between hard pulling sessions; return when recovered, not to protect a streak. There is no fixed timeline. Stop for pain or loss of control.';
export const TRAINING_NOTICE = 'General training guidance, not personalized medical advice or coaching. Use secure, load-rated equipment with clear space above and below the bar. Warm up gently before working sets.';
export const PLATEAU_GUIDANCE = 'Repeat this session after recovery until the targets feel controlled; do not add reps to every exercise. If a strict target is missed, use enough band or safe foot assistance for the remaining planned reps instead of adding more sets. Mark any substituted, missed or shortened set as unmet and save practice, not mastery. Keep the easy assistance work easy and the other targets fixed. Stop if fatigued or in pain; rest rather than trying to make up volume.';
const bar = ['Secure straight pull-up bar'];
const platform = [...bar, 'Safe stable platform at a suitable height'];
const band = [...platform, 'Suitable resistance band, inspected and securely attached'];
const optionalBand = [...platform, 'Suitable inspected resistance band OR a safe feet-supported setup'];
const access = 'Use a safe stable platform to step into support and step down. Never jump blindly onto a high bar or use unstable furniture. If safe access is unavailable, do not start.';
const definitions = {
  hang: ['Supported Hang', 'seconds', 120, 'Keep feet on a safe stable platform, unloading enough weight for a comfortable grip. Breathe; stop before grip slips.', platform],
  scap: ['Supported Scapular Pull-ups', 'reps', 120, 'Feet stay supported. With straight elbows, gently lower and raise the body through the shoulder blades. No forced range or shrugging through pain.', platform],
  assisted: ['Assisted Pull-ups', 'reps', 150, 'Use a band or feet on a suitable stable platform to make every rep controlled from long arms to chin over bar. Keep the same assistance across these volume steps. If one rep is not controlled, add assistance and repeat.', optionalBand],
  strict: ['Strict Pull-ups', 'reps', 180, 'Start still with long arms, pull chin above bar without kicking, then lower under control. Stop short of grinding; use assistance and log practice if a clean target is not available.', bar],
  support: ['Supported Straight-Bar Support', 'seconds', 120, `${access} Keep feet supported, bar near hips, elbows straight, shoulders steady. Increase time only; keep foot assistance unchanged.`, platform],
  freeSupport: ['Straight-Bar Support', 'seconds', 150, `${access} Lift feet only if steady: straight elbows, bar close to hips, shoulders controlled. Keep the platform ready for a controlled exit.`, platform],
  assistedDip: ['Assisted Straight-Bar Dips', 'reps', 180, `${access} Feet on a suitable platform unload the dip. Lean slightly over the single straight bar; bend elbows only through a comfortable controlled range, then press to support. Keep assistance and range unchanged as reps grow.`, platform],
  dip: ['Straight-Bar Dips', 'reps', 180, `${access} From steady support, lower with control through your established comfortable range and press to straight elbows. No bounce or forced depth. This is a straight-bar dip, not rings or parallel bars.`, platform],
  assistedChest: ['Assisted Chest-to-Bar Pull-ups', 'reps', 180, 'Use enough band assistance to bring upper chest toward the bar without kicking. A feet-supported low-bar pull is an alternative if the setup permits the same controlled path. Keep assistance fixed while adding reps.', optionalBand],
  chest: ['Chest-to-Bar Pull-ups', 'reps', 180, 'Start still and pull upper chest to bar height with control. This is a new skill, not an automatic consequence of pull-up volume. If height is lost, return to assisted practice.', bar],
  high: ['Higher Pulls', 'reps', 240, 'Pull fast from a controlled hang, aiming slightly below the upper chest toward the lower chest. Use only height you can control; no large swing or hip-to-bar requirement. Stop when speed or height drops.', bar],
  turnover: ['Feet-Supported Bar Turnover', 'reps', 180, `${access} Use a low straight bar with feet securely on the ground or a stable platform. Let legs carry most weight. Bring chest close, turn both wrists over together, then press to support. No one-arm chicken-wing turnover.`, ['Secure low straight bar', 'Safe stable platform if needed for foot support']],
  muscleAssist: ['Band-Assisted Bar Muscle-ups', 'reps', 240, 'Use a suitable inspected band with safe entry from a stable platform; learn the setup before loading it. Pull close, turn both elbows over together and press into controlled support. Keep band/setup fixed for volume steps. No improvised straps or unsafe jump starts.', band],
  attempt: ['Controlled Muscle-Up Attempts', 'attempts', 300, 'One fresh attempt per set, with full recovery. Pull close, turn both arms over together, press to support. Stop a failed attempt safely; do not keep grinding. Attempts are practice, not successful muscle-ups.', bar],
  muscle: ['Controlled Bar Muscle-ups', 'reps', 300, 'From a controlled hang, pull close, turn both arms over together and finish in steady straight-arm support. No large kip or one-arm turnover. A failed attempt is not a rep: report practice and retry after recovery.', bar],
} as const;
type Movement = keyof typeof definitions;
function exercise(key: Movement, targets: number[], variation = 'standard'): Exercise {
  const [name, unit, restSeconds, description, equipment] = definitions[key];
  return { id: key, name, targets, unit, restSeconds, description, equipment: [...equipment], variation };
}
function lesson(id: string, title: string, change: string, exercises: Exercise[], readiness = 'Complete every prescribed set with control and reserve. If targets are unmet, keep this step and repeat after recovery.', requiresSuccess = false): Lesson {
  const focus = exercises[0]!.name;
  const plateau = exercises.some(ex => ex.name === definitions.strict[0])
    ? PLATEAU_GUIDANCE
    : exercises.some(ex => ex.unit === 'attempts' || ex.name === definitions.muscle[0])
      ? 'Keep attempts few and fully rested. If unsuccessful, save practice and repeat after recovery or revisit an earlier assisted transition lesson. Do not add repeated failed attempts to make up a missed rep. Only actual controlled unassisted reps achieve the goal.'
      : 'Repeat the same targets after recovery. Keep assistance generous enough for control; if needed, use more support rather than forcing range or adding sets. Change assistance, range or reps one at a time. Mark missed, substituted or shortened sets as unmet and save practice; do not advance until this prescription is controlled.';
  return { id: `bar-v2-${id}`, title, change, exercises: exercises.map((ex, i) => ({ ...ex, id: `bar-v2-${id}-e${i + 1}` })), readiness, requiresSuccess,
    focus, plateau };
}
const L = lesson;
const E = exercise;
// Each comparable volume step adds one total rep, including a new set at one rep.
const baseTargets = [
  [1, 1], [2, 1], [2, 2], [2, 2, 1], [2, 2, 2],
  [3, 2, 2], [3, 3, 2], [3, 3, 3], [4, 3, 3], [4, 4, 3],
  [4, 4, 4], [5, 4, 4], [5, 5, 4], [5, 5, 5],
];
const maintenance = () => [E('strict', [2, 2])];
const dipMaintenance = () => E('dip', [1, 1]);
const easyHang = () => E('hang', [10]);
const easyScap = () => E('scap', [1]);
const assistedBackoff = () => E('assisted', [2], 'easy back-off assistance');
function baseLesson(targets: number[], i: number): Lesson {
  const title = [
    'Two Separate Singles', 'One More on Set One', 'Two and Two', 'A Small Third Set', 'Three Sets of Two',
    'Build the First Set', 'Build the Second Set', 'Three Sets of Three', 'A Controlled Fourth', 'Share the Fourth',
    'Three Sets of Four', 'Your First Five', 'Two Sets of Five', 'Three Controlled Fives',
  ][i]!;
  return L(`base-${i + 1}`, title,
    i === 0
      ? 'Add a second strict single. Keep the two easy assisted back-off reps and short supported hang unchanged.'
      : 'Add one total strict pull-up only. The two easy assisted reps and brief supported hold stay fixed; do not reduce assistance or increase their targets.',
    [E('strict', targets), assistedBackoff(), i === 0 ? easyHang() : E('support', [5])],
    'Complete all strict targets without grinding, then use generous assistance for the two easy back-off reps. Supported top holds keep feet loaded and require safe platform access. 3 × 5 opens Support & Dips; pulling continues toward 3 × 8 there, not outside the program.');
}
// A support/dip lesson changes only the pushing skill. A strength lesson changes
// only one strict pull-up rep while keeping the support/dip prescription fixed.
function supportSession(id: string, title: string, change: string, pulls: number[], skill: Movement, targets: number[], variation = 'standard'): Lesson {
  const strict = E('strict', pulls);
  const accessory = E(skill, targets, variation);
  return L(id, title, change, id.startsWith('strength-') ? [strict, accessory] : [accessory, strict],
    'Complete both prescriptions with control. On a support/dip focus, strict targets stay fixed. On a pulling focus, support/dip targets stay fixed. 3 × 8 is this roadmap’s gradual strength target, not a universal guarantee of muscle-up readiness. Repeat or use assistance and log practice if needed.');
}
const S = supportSession;
function heightSession(id: string, title: string, change: string, skill: 'assistedChest' | 'chest' | 'high', targets: number[], variation = 'standard'): Lesson {
  const result = L(id, title,
    `${change} Strict pull-ups stay 4 / 4 and straight-bar dips stay 2 / 2; do not increase the supporting work.`,
    [E(skill, targets, variation), E('strict', [4, 4]), E('dip', [2, 2])],
    'Practice height first while fresh, then complete the reduced strict pulling and dip work with control. Use enough assistance for clean assisted chest-to-bar reps. Rest at least three minutes for chest-to-bar and strength sets, four minutes for faster higher pulls; extend as needed. Do not add the previous 3 × 8 workout on top.');
  result.plateau = `If height or speed fades, stop the skill work rather than grinding or adding attempts. Keep the strict pull-ups and dips fixed, and mark any missed or substituted set as unmet. ${PLATEAU_GUIDANCE}`;
  return result;
}
const H = heightSession;
export const TRACK_NODES: TrackNode[] = [
  {
    id: 'hang-control', title: 'Hang & Control', subtitle: 'Grip, shoulders, assisted reps', icon: 'hand-left-outline', nodeColor: '#4ADE80',
    lessons: [
      L('grip-1', 'A Comfortable Grip', 'Begin with one short feet-supported hold. Assistance is expected.', [E('hang', [10])]),
      L('grip-2', 'A Little Longer', 'Only the supported hold grows by five seconds.', [E('hang', [15])]),
      L('scap-1', 'Find Your Shoulders', 'Introduce one supported scapular rep. Shorten the comfortable supported hang to ten seconds so the new skill does not add another full-volume exercise.', [E('scap', [1]), easyHang()]),
      L('scap-2', 'Repeat the Control', 'Add just one supported scapular rep; the easy hang stays fixed.', [E('scap', [2]), easyHang()]),
      L('scap-3', 'A Second Small Set', 'Add a second scapular set at one rep; keep the hang unchanged.', [E('scap', [2, 1]), easyHang()]),
      L('assist-1', 'Your Assisted Pull', 'Introduce one full-range assisted pull. Reduce scapular practice to one easy rep; keep the short hang.', [E('assisted', [1], 'generous assistance'), easyScap(), easyHang()]),
      L('assist-2', 'Two Assisted Reps', 'Add one assisted pull only. Keep assistance, the scapular single and the hang unchanged.', [E('assisted', [2], 'generous assistance'), easyScap(), easyHang()]),
      L('assist-3', 'Rest and Repeat', 'Add a second assisted set at one rep. All other targets and assistance stay fixed.', [E('assisted', [2, 1], 'generous assistance'), easyScap(), easyHang()]),
      L('assist-4', 'Balanced Assisted Sets', 'Only the second assisted set gains one rep; easy shoulder and grip work stay fixed.', [E('assisted', [2, 2], 'generous assistance'), easyScap(), easyHang()]),
      L('assist-5', 'A Little Less Help', 'Reduce assistance one small step and cut the main work to two singles. Keep accessories fixed. Repeat at each smaller assistance level until a strict single is available.', [E('assisted', [1, 1], 'slightly reduced assistance'), easyScap(), easyHang()]),
      L('single-1', 'One Strict Single', 'Introduce one strict rep. Replace the scapular single with two easy generously assisted back-off reps and retain the short hang; no extra hard pulling sets.', [E('strict', [1]), assistedBackoff(), easyHang()], 'A controlled unassisted single is required. Assistance builds practice but does not count as the strict target. Keep the two assisted back-off reps easy, not a second hard workout.'),
    ],
  },
  {
    id: 'pull-base', title: 'Pull-Up Base', subtitle: 'Build three controlled sets of five', icon: 'barbell-outline', nodeColor: '#60A5FA',
    lessons: [
      baseLesson(baseTargets[0]!, 0),
      L('base-support', 'An Easy Top-Position Accessory', 'Keep strict singles and assisted back-off reps unchanged. Replace the hang with a five-second feet-supported top hold; learn safe access before adding pulling reps.', [E('support', [5]), E('strict', [1, 1]), assistedBackoff()]),
      ...baseTargets.slice(1).map((targets, i) => baseLesson(targets, i + 1)),
    ],
  },
  {
    id: 'support-dips', title: 'Support & Dips', subtitle: 'Alternate pushing skills and pulling strength toward 3 × 8', icon: 'body-outline', nodeColor: '#A78BFA',
    lessons: [
      S('support-1', 'Safe Access to the Top', 'Retain 5 / 5 / 5 pulling and the brief supported hold. Remove the assisted back-off work to leave room for pushing practice. Rehearse safe access.', [5, 5, 5], 'support', [5]),
      S('support-2', 'Settle in Support', 'Only the supported hold grows to ten seconds. Strict pulling stays 5 / 5 / 5.', [5, 5, 5], 'support', [10]),
      S('support-3', 'Balance Above the Bar', 'Remove foot assistance for one shorter five-second hold. Strict pulling stays unchanged.', [5, 5, 5], 'freeSupport', [5]),
      S('strength-1', 'Pulling Strength: 6 / 5 / 5', 'Pulling focus: add one strict rep to set one. Repeat the same five-second support; do not increase the hold.', [6, 5, 5], 'freeSupport', [5]),
      S('support-4', 'Steady Top Position', 'Support focus: grow the hold to ten seconds; strict pulling stays 6 / 5 / 5.', [6, 5, 5], 'freeSupport', [10]),
      S('strength-2', 'Pulling Strength: 6 / 6 / 5', 'Pulling focus: add one rep to set two. The ten-second support is unchanged.', [6, 6, 5], 'freeSupport', [10]),
      S('dip-a1', 'The Supported Dip', 'Pushing focus: replace the hold with one feet-assisted straight-bar dip. Pulling stays 6 / 6 / 5.', [6, 6, 5], 'assistedDip', [1]),
      S('strength-3', 'Three Controlled Sixes', 'Pulling focus: add one rep to set three for 6 / 6 / 6. Keep the single assisted dip exactly the same.', [6, 6, 6], 'assistedDip', [1]),
      S('dip-a2', 'Two Supported Dips', 'Pushing focus: add one assisted dip. Keep pulling at 6 / 6 / 6, assistance and dip depth unchanged.', [6, 6, 6], 'assistedDip', [2]),
      S('strength-4', 'Pulling Strength: 7 / 6 / 6', 'Pulling focus: add one rep to set one. The two assisted dips stay fixed.', [7, 6, 6], 'assistedDip', [2]),
      S('dip-a3', 'Repeat with Support', 'Pushing focus: introduce a second assisted dip set at one rep. Pulling stays 7 / 6 / 6.', [7, 6, 6], 'assistedDip', [2, 1]),
      S('strength-5', 'Pulling Strength: 7 / 7 / 6', 'Pulling focus: add one rep to set two. Assisted dips stay 2 / 1.', [7, 7, 6], 'assistedDip', [2, 1]),
      S('dip-a4', 'Even Supported Sets', 'Pushing focus: add one rep to the second assisted dip set. Pulling stays 7 / 7 / 6.', [7, 7, 6], 'assistedDip', [2, 2]),
      S('strength-6', 'Three Controlled Sevens', 'Pulling focus: add one rep to set three. Assisted dips stay 2 / 2 with the same help.', [7, 7, 7], 'assistedDip', [2, 2]),
      S('dip-a5', 'Less Leg Assistance', 'Pushing focus: reduce foot assistance slightly and drop dips to two singles. Pulling stays 7 / 7 / 7; do not change dip depth.', [7, 7, 7], 'assistedDip', [1, 1], 'less foot assistance'),
      S('dip-1', 'Your First Bar Dip', 'Pushing focus: remove assistance for one controlled dip, with the same comfortable range. Pulling stays 7 / 7 / 7.', [7, 7, 7], 'dip', [1]),
      S('strength-7', 'Pulling Strength: 8 / 7 / 7', 'Pulling focus: add one rep to set one. Keep only the same single straight-bar dip.', [8, 7, 7], 'dip', [1]),
      S('dip-2', 'Two Clean Bar Dips', 'Pushing focus: add one straight-bar dip. Pulling stays 8 / 7 / 7.', [8, 7, 7], 'dip', [2]),
      S('strength-8', 'Pulling Strength: 8 / 8 / 7', 'Pulling focus: add one rep to set two. Keep the two dips unchanged.', [8, 8, 7], 'dip', [2]),
      S('dip-3', 'A Second Dip Set', 'Pushing focus: add a second dip set at one rep. Pulling stays 8 / 8 / 7.', [8, 8, 7], 'dip', [2, 1]),
      S('strength-9', 'Three Controlled Eights', 'Pulling focus: add one rep to set three for 8 / 8 / 8. Dips stay 2 / 1. This does not automatically establish chest-to-bar height or transition readiness.', [8, 8, 8], 'dip', [2, 1]),
      S('dip-4', 'Repeatable Bar Dips', 'Pushing focus: add one rep to the second dip set. Pulling stays 8 / 8 / 8; the next phase introduces new height at low volume.', [8, 8, 8], 'dip', [2, 2]),
    ],
  },
  {
    id: 'higher-pulls', title: 'Higher Pulls', subtitle: 'Height practice plus a reduced strength base', icon: 'flash-outline', nodeColor: '#F59E0B',
    lessons: [
      H('height-a1', 'Assisted Chest Height', 'Introduce three fully rested assisted chest-to-bar singles. Reduce strict pulling from 8 / 8 / 8 to 4 / 4 to make room for the new skill, and retain the earned 2 / 2 dips.', 'assistedChest', [1, 1, 1]),
      H('height-a2', 'Build the First Height Set', 'Add one assisted chest-to-bar rep to the first set only. Keep assistance unchanged.', 'assistedChest', [2, 1, 1]),
      H('height-a3', 'Build the Second Height Set', 'Add one assisted chest-to-bar rep to the second set only. Keep assistance unchanged.', 'assistedChest', [2, 2, 1]),
      H('height-a4', 'Three Assisted Doubles', 'Add one assisted chest-to-bar rep to the third set only. Keep assistance unchanged.', 'assistedChest', [2, 2, 2]),
      H('height-a5', 'Less Help at Height', 'Reduce assistance slightly and drop the skill work to two singles. Repeat at each assistance level before unassisted work.', 'assistedChest', [1, 1], 'less band assistance'),
      H('height-1', 'One Chest-to-Bar', 'Remove assistance for just one controlled chest-to-bar rep. Return to assisted practice if height is unavailable.', 'chest', [1]),
      H('height-2', 'Two Fresh Height Sets', 'Add a second chest-to-bar set at one rep.', 'chest', [1, 1]),
      H('height-3', 'Three Height Singles', 'Add only one more chest-to-bar single set.', 'chest', [1, 1, 1]),
      H('high-1', 'A Little More Height', 'Introduce faster, slightly higher pulling at one rep; lower skill volume and allow four-minute rests.', 'high', [1]),
      H('high-2', 'Two Fast Singles', 'Add only a second higher-pull single. Preserve speed, height and full rest.', 'high', [1, 1]),
      H('high-3', 'Three Fast Singles', 'Add only a third higher-pull single, not more reps in each set.', 'high', [1, 1, 1]),
    ],
  },
  {
    id: 'assisted-turnover', title: 'Assisted Transition', subtitle: 'Connect pulling to support', icon: 'shuffle-outline', nodeColor: '#F43F5E',
    lessons: [
      L('turn-1', 'Feet-Supported Turnover', 'Replace higher pulls with one heavily feet-supported turnover. Reduce strict pull maintenance to 2/2 and dips to 1/1 to make room for transition practice.', [E('turnover', [1]), ...maintenance(), dipMaintenance()]),
      L('turn-2', 'Two Supported Turnovers', 'Add one supported turnover; legs still carry most weight.', [E('turnover', [2]), ...maintenance(), dipMaintenance()]),
      L('turn-3', 'Repeat the Turnover', 'Add a second turnover set at one rep; do not reduce support.', [E('turnover', [2, 1]), ...maintenance(), dipMaintenance()]),
      L('turn-4', 'Less Help Through the Turn', 'Use slightly less leg support and cut turnover volume to two singles. Repeat as needed; no forced transition.', [E('turnover', [1, 1], 'slightly less leg support'), ...maintenance(), dipMaintenance()]),
      L('band-1', 'Connect with a Band', 'Introduce one band-assisted full muscle-up; remove turnover drill volume. Maintenance is unchanged.', [E('muscleAssist', [1], 'generous band assistance'), ...maintenance(), dipMaintenance()]),
      L('band-2', 'Two Assisted Singles', 'Add a second assisted muscle-up single, with the same band and setup.', [E('muscleAssist', [1, 1], 'generous band assistance'), ...maintenance(), dipMaintenance()]),
      L('band-3', 'Three Assisted Singles', 'Add only a third assisted single. Do not reduce assistance yet.', [E('muscleAssist', [1, 1, 1], 'generous band assistance'), ...maintenance(), dipMaintenance()]),
      L('band-4', 'A Smaller Assist', 'Reduce band assistance by one available small step and lower volume to two singles. Repeat this lesson at each smaller assistance level before unassisted attempts.', [E('muscleAssist', [1, 1], 'one smaller band assistance level'), ...maintenance(), dipMaintenance()], 'Both assisted singles must finish in controlled support. Optional technique tool ONLY after steady support: one supported slow turnover descent instead of a turnover drill, never mandatory or additional high-volume negatives.'),
    ],
  },
  {
    id: 'first-muscle-up', title: 'First Muscle-Up', subtitle: 'Fresh attempts, then clean singles', icon: 'trophy-outline', nodeColor: '#FF5722',
    lessons: [
      L('attempt-1', 'Fresh Attempt Practice', 'Replace assisted work with two well-rested unassisted attempts; omit accessories to stay fresh. A controlled attempt session is not a successful muscle-up.', [E('attempt', [1, 1])], 'You may complete attempt practice if both safe attempts were taken with full recovery and control, even if unsuccessful. The goal remains unachieved. Stop early and log practice if fatigued.'),
      L('success-1', 'Your First Controlled Muscle-Up', 'Aim for one actual unassisted rep, not more attempts. If it does not happen, log practice and retry after recovery.', [E('muscle', [1])], 'Explicitly confirm an actual unassisted rep from hang to steady straight-arm support with both arms turning over together. A failed attempt does not meet this target.', true),
      L('success-2', 'Repeat a Clean Single', 'Repeat the same one-rep prescription on a recovered session. No volume increase is needed.', [E('muscle', [1])], 'One actual clean unassisted rep is required. Repeat or return to assisted work when needed.', true),
      L('success-3', 'Repeatable Clean Singles', 'Add one separate single with five minutes of recovery. No linked reps or advanced variations required.', [E('muscle', [1, 1])], 'Both singles must be actual controlled unassisted muscle-ups. An attempt alone is practice.', true),
    ],
  },
];

export const ALL_LESSONS = TRACK_NODES.flatMap(node => node.lessons);
export const GOAL_LESSON_ID = 'bar-v2-success-1';
export const formatTargetUnit = (ex: Pick<Exercise, 'unit'>, target: number) =>
  ex.unit === 'seconds' ? 'sec' : target === 1 ? (ex.unit === 'reps' ? 'rep' : 'attempt') : ex.unit;
export const formatTargets = (ex: Exercise) => {
  const uniform = ex.targets.every(n => n === ex.targets[0]);
  const values = uniform ? `${ex.targets.length} × ${ex.targets[0]}` : ex.targets.join(' / ');
  return `${values} ${formatTargetUnit(ex, uniform ? ex.targets[0]! : Math.max(...ex.targets))}`;
};
export const formatSetTarget = (ex: Exercise, set: number) => `${ex.targets[set]} ${formatTargetUnit(ex, ex.targets[set]!)}`;
export const getLessonById = (id: string) => {
  for (const node of TRACK_NODES) {
    const lesson = node.lessons.find(l => l.id === id);
    if (lesson) return { lesson, node };
  }
  return null;
};
export const getNextLesson = (credited: string[]) => {
  const next = ALL_LESSONS.find(l => !credited.includes(l.id));
  return next ? getLessonById(next.id) : null;
};
export const canStartLesson = (id: string, credited: string[]) => {
  const index = ALL_LESSONS.findIndex(l => l.id === id);
  return index >= 0 && (credited.includes(id) || ALL_LESSONS.slice(0, index).every(l => credited.includes(l.id)));
};
export const getNodeProgress = (id: string, credited: string[]) => {
  const lessons = TRACK_NODES.find(n => n.id === id)?.lessons ?? [];
  return { completed: lessons.filter(l => credited.includes(l.id)).length, total: lessons.length };
};
export const getNodeStatus = (id: string, credited: string[]): 'completed' | 'active' | 'locked' => {
  const node = TRACK_NODES.find(n => n.id === id);
  if (!node) return 'locked';
  if (node.lessons.every(l => credited.includes(l.id))) return 'completed';
  return node.lessons.some(l => canStartLesson(l.id, credited)) ? 'active' : 'locked';
};
export const getCurrentLevel = (credited: string[]) => {
  const node = getNextLesson(credited)?.node ?? TRACK_NODES[TRACK_NODES.length - 1]!;
  const progress = getNodeProgress(node.id, credited);
  return { level: TRACK_NODES.indexOf(node) + 1, node, lessonsComplete: progress.completed, lessonsTotal: progress.total };
};

export interface PlacementAnswers {
  pullUps: number;
  repeatableFives: boolean;
  repeatableEights: boolean;
  supportAndDips: boolean;
  higherPulls: boolean;
  assistedTransition: boolean;
}
export const EMPTY_PLACEMENT: PlacementAnswers = { pullUps: 0, repeatableFives: false, repeatableEights: false, supportAndDips: false, higherPulls: false, assistedTransition: false };
export function getPlacement(answers: PlacementAnswers, earlierId?: string) {
  // A max set never establishes repeatable sets or a different skill.
  let id = 'bar-v2-grip-1';
  if (answers.pullUps >= 1) id = 'bar-v2-single-1';
  if (answers.pullUps >= 3) id = 'bar-v2-base-1';
  if (answers.pullUps >= 5 && answers.repeatableFives) {
    id = 'bar-v2-support-1';
    if (answers.supportAndDips && answers.pullUps >= 8 && answers.repeatableEights) {
      id = 'bar-v2-height-a1';
      if (answers.higherPulls) {
        id = 'bar-v2-turn-1';
        if (answers.assistedTransition) id = 'bar-v2-attempt-1';
      }
    }
  }
  const recommendedIndex = ALL_LESSONS.findIndex(l => l.id === id);
  const earlierIndex = ALL_LESSONS.findIndex(l => l.id === earlierId);
  const index = earlierIndex >= 0 && earlierIndex <= recommendedIndex ? earlierIndex : recommendedIndex;
  return { entry: getLessonById(ALL_LESSONS[index]!.id)!, assessedLessonIds: ALL_LESSONS.slice(0, index).map(l => l.id), recommendedIndex, index };
}
