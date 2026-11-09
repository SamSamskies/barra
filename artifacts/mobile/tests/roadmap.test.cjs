const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Test the actual pure TypeScript model, without loading Expo native modules.
const modules = new Map();
function load(file) {
  file = path.resolve(__dirname, file);
  if (modules.has(file)) return modules.get(file);
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function('require', 'module', 'exports', code)(
    name => load(path.resolve(path.dirname(file), `${name}.ts`)), mod, mod.exports);
  modules.set(file, mod.exports);
  return mod.exports;
}
const track = load('../constants/track.ts');
const demos = load('../constants/demos.ts').EXERCISE_DEMOS;
const p = load('../lib/progression.ts');
const { ALL_LESSONS: lessons, TRACK_NODES: phases } = track;
const input = (lessonId, overrides = {}) => ({
  id: `test-${Math.random()}`, lessonId, skippedSets: 0, targetsMet: true, ready: true, actualSuccess: false, ...overrides,
});
const placed = () => p.placeUser(p.freshState(), track.EMPTY_PLACEMENT);
function storage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: async key => data.get(key) ?? null,
    setItem: async (key, value) => { data.set(key, value); },
    removeItem: async key => { data.delete(key); },
  };
}
test('six complete phases, new unique IDs, positive numeric set targets, cues and demos', () => {
  assert.deepEqual(phases.map(n => n.title), ['Hang & Control', 'Pull-Up Base', 'Support & Dips', 'Higher Pulls', 'Assisted Transition', 'First Muscle-Up']);
  assert.equal(new Set(phases.map(n => n.id)).size, phases.length);
  const ids = [];
  for (const phase of phases) {
    assert.ok(phase.lessons.length >= 4);
    for (const lesson of phase.lessons) {
      ids.push(lesson.id);
      assert.match(lesson.id, /^bar-v2-/);
      assert.ok(lesson.title && lesson.change && lesson.readiness && lesson.plateau);
      assert.ok(lesson.exercises.some(ex => ex.name === lesson.focus));
      for (const ex of lesson.exercises) {
        ids.push(ex.id);
        assert.ok(ex.targets.length && ex.targets.every(n => Number.isInteger(n) && n > 0));
        assert.ok(ex.description && ex.equipment.length && demos[ex.name]);
        assert.ok(ex.restSeconds >= 120);
        assert.doesNotMatch(ex.name, /ring|weighted|archer/i);
      }
    }
  }
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(track.getLessonById('foundation-1'), null);
});
test('adjacent comparable prescriptions grow only one exercise and one total rep', () => {
  for (const phase of phases) {
    for (let i = 1; i < phase.lessons.length; i++) {
      const prev = phase.lessons[i - 1], next = phase.lessons[i];
      const increases = [];
      for (const ex of next.exercises) {
        const before = prev.exercises.find(e => e.name === ex.name && e.variation === ex.variation);
        if (!before) continue;
        const delta = ex.targets.reduce((a, b) => a + b, 0) - before.targets.reduce((a, b) => a + b, 0);
        if (delta > 0) {
          increases.push(ex);
          assert.ok(delta <= (ex.unit === 'seconds' ? 5 : 1), `${next.title}: ${delta} jump`);
        }
        if (ex.targets.length > before.targets.length) assert.equal(ex.targets.at(-1), 1);
      }
      assert.ok(increases.length <= 1, `${next.title} increases multiple exercises`);
    }
  }
});
test('harder movement or assistance changes use low volume, maintenance stays modest', () => {
  for (const phase of phases) for (let i = 1; i < phase.lessons.length; i++) {
    const prev = phase.lessons[i - 1], next = phase.lessons[i];
    for (const ex of next.exercises) {
      const before = prev.exercises.find(e => e.name === ex.name);
      if (before && before.variation !== ex.variation) {
        assert.ok(ex.targets.reduce((a, b) => a + b, 0) <= before.targets.reduce((a, b) => a + b, 0));
      }
      if (!before && ex.unit !== 'seconds') assert.ok(ex.targets.reduce((a, b) => a + b, 0) <= 2);
    }
  }
  assert.deepEqual(phases[2].lessons[0].exercises.find(ex => ex.name === 'Strict Pull-ups').targets, [5, 5, 5]);
  assert.deepEqual(phases[2].lessons.at(-1).exercises.find(ex => ex.name === 'Strict Pull-ups').targets, [8, 8, 8]);
  for (const lesson of phases[4].lessons) {
    assert.deepEqual(lesson.exercises.find(e => e.name === 'Strict Pull-ups').targets, [2, 2]);
    assert.deepEqual(lesson.exercises.find(e => e.name === 'Straight-Bar Dips').targets, [1, 1]);
  }
  assert.deepEqual(phases[1].lessons.at(-1).exercises[0].targets, [5, 5, 5]);
});
test('uneven, timed, uniform and attempt targets render honestly', () => {
  const sample = (targets, unit) => ({ targets, unit });
  assert.equal(track.formatTargets(sample([5, 4, 4], 'reps')), '5 / 4 / 4 reps');
  assert.equal(track.formatSetTarget(sample([5, 4, 4], 'reps'), 1), '4 reps');
  assert.equal(track.formatTargets(sample([5, 5], 'seconds')), '2 × 5 sec');
  assert.equal(track.formatTargets(sample([1, 1], 'attempts')), '2 × 1 attempts');
});
test('single max set does not prove work sets or advanced skills; earlier choice is honored', () => {
  const a = { ...track.EMPTY_PLACEMENT };
  for (const n of [0, 1, 2, 3, 4, 5, 10, 50]) {
    const point = track.getPlacement({ ...a, pullUps: n });
    assert.equal(point.entry.lesson.id, n === 0 ? 'bar-v2-grip-1' : n < 3 ? 'bar-v2-single-1' : 'bar-v2-base-1');
  }
  const ready = { pullUps: 8, repeatableFives: true, repeatableEights: true, supportAndDips: true, higherPulls: true, assistedTransition: true };
  const expectations = [
    [{ ...ready, repeatableFives: false }, 'bar-v2-base-1'],
    [{ ...ready, supportAndDips: false }, 'bar-v2-support-1'],
    [{ ...ready, repeatableEights: false }, 'bar-v2-support-1'],
    [{ ...ready, pullUps: 7 }, 'bar-v2-support-1'],
    [{ ...ready, higherPulls: false }, 'bar-v2-height-a1'],
    [{ ...ready, assistedTransition: false }, 'bar-v2-turn-1'],
    [ready, 'bar-v2-attempt-1'],
  ];
  for (const [answers, id] of expectations) assert.equal(track.getPlacement(answers).entry.lesson.id, id);
  assert.equal(track.getPlacement(ready, lessons[0].id).entry.lesson.id, lessons[0].id);
  assert.equal(track.getPlacement(a, lessons.at(-1).id).entry.lesson.id, lessons[0].id);
  assert.equal(track.getPlacement({ ...ready, pullUps: 4 }).entry.lesson.id, 'bar-v2-base-1');
});
test('placement credit is not mastery, history, sessions or streak; assessed lessons can be repeated', () => {
  let state = p.placeUser(p.freshState(), { ...track.EMPTY_PLACEMENT, pullUps: 10 });
  assert.ok(state.assessedLessonIds.length > 0);
  assert.equal(state.completedLessonIds.length, 0);
  assert.equal(state.workoutHistory.length, 0);
  assert.equal(state.streak, 0);
  state = p.recordSession(state, input(lessons[0].id));
  assert.equal(state.workoutHistory[0].outcome, 'repeat');
  assert.equal(state.completedLessonIds.length, 1);
  assert.throws(() => p.placeUser(state, track.EMPTY_PLACEMENT));
});
test('locked lessons inspectable in catalog, but cannot start or bypass route protection', () => {
  const state = placed();
  assert.ok(track.getLessonById(lessons.at(-1).id));
  assert.equal(track.canStartLesson(lessons[0].id, []), true);
  assert.equal(track.canStartLesson(lessons[1].id, []), false);
  assert.equal(track.canStartLesson('foundation-1', []), false);
  assert.equal(track.getNodeStatus(phases[1].id, []), 'locked');
  assert.throws(() => p.recordSession(state, input(lessons[1].id)), /locked/);
  assert.throws(() => p.recordSession(p.freshState(), input(lessons[0].id)), /locked/);
  const code = fs.readFileSync(path.join(__dirname, '../app/workout/[id].tsx'), 'utf8');
  assert.match(code, /const unlocked = canStartLesson/);
  assert.match(code, /phase === 'intro' \|\| !unlocked/);
});
test('unmet, skipped or unconfirmed sessions are practice and never unlock; repeats count once each', () => {
  for (const override of [{ skippedSets: 1 }, { targetsMet: false }, { ready: false }]) {
    const state = p.recordSession(placed(), input(lessons[0].id, override));
    assert.equal(state.workoutHistory[0].outcome, 'practice');
    assert.deepEqual(state.completedLessonIds, []);
    assert.equal(track.canStartLesson(lessons[1].id, p.creditedIds(state)), false);
  }
  let state = p.recordSession(placed(), input(lessons[0].id));
  assert.equal(track.canStartLesson(lessons[1].id, p.creditedIds(state)), true);
  const repeat = input(lessons[0].id);
  state = p.recordSession(state, repeat);
  assert.equal(state.workoutHistory.length, 2);
  assert.equal(state.workoutHistory[0].outcome, 'repeat');
  assert.equal(state.completedLessonIds.length, 1);
  assert.equal(p.recordSession(state, repeat).workoutHistory.length, 2);
  // Rest skipping is deliberately not an invalidation input.
  assert.equal(state.workoutHistory[0].targetsMet, true);
});
test('attempt lesson is not goal success; actual self-report required for all muscle-up milestones', () => {
  const answers = { pullUps: 8, repeatableFives: true, repeatableEights: true, supportAndDips: true, higherPulls: true, assistedTransition: true };
  let state = p.placeUser(p.freshState(), answers);
  state = p.recordSession(state, input('bar-v2-attempt-1'));
  assert.equal(state.completedLessonIds.includes(track.GOAL_LESSON_ID), false);
  const failed = p.recordSession(state, input(track.GOAL_LESSON_ID));
  assert.equal(failed.workoutHistory[0].outcome, 'practice');
  state = p.recordSession(failed, input(track.GOAL_LESSON_ID, { actualSuccess: true }));
  assert.ok(state.completedLessonIds.includes(track.GOAL_LESSON_ID));
  assert.equal(p.recordSession(state, input('bar-v2-success-2')).workoutHistory[0].outcome, 'practice');
  assert.equal(p.recordSession(state, input('bar-v2-success-2', { actualSuccess: true })).workoutHistory[0].outcome, 'mastered');
});
test('undo revokes downstream credit but keeps all real sessions, repeats and streak', () => {
  let state = placed();
  state = p.recordSession(state, input(lessons[0].id));
  state = p.recordSession(state, input(lessons[0].id));
  state = p.recordSession(state, input(lessons[1].id));
  const undone = p.undoCredit(state, lessons[0].id);
  assert.equal(undone.completedLessonIds.length, 0);
  assert.deepEqual(undone.workoutHistory, state.workoutHistory);
  assert.equal(undone.streak, state.streak);
  assert.equal(track.canStartLesson(lessons[1].id, p.creditedIds(undone)), false);
});
test('legacy data is cleared once, notice survives relaunch, new progress persists, reset does not repeat migration', async () => {
  const store = storage({ [p.LEGACY_STORAGE_KEY]: JSON.stringify({ onboardingComplete: true, completedLessonIds: ['foundation-1'], streak: 80, workoutHistory: [1] }), unrelated: 'keep' });
  let state = await p.loadProgress(store);
  assert.equal(state.rebuildNotice, true);
  assert.equal(state.onboardingComplete, false);
  assert.equal(state.streak, 0);
  assert.deepEqual(state.workoutHistory, []);
  assert.equal(await store.getItem(p.LEGACY_STORAGE_KEY), null);
  assert.deepEqual(await p.loadProgress(store), state);
  state = p.recordSession(p.placeUser(state, track.EMPTY_PLACEMENT), input(lessons[0].id));
  await store.setItem(p.STORAGE_KEY, JSON.stringify(state));
  assert.deepEqual(await p.loadProgress(store), state);
  await store.setItem(p.STORAGE_KEY, JSON.stringify(p.freshState()));
  const reset = await p.loadProgress(store);
  assert.equal(reset.rebuildNotice, false);
  assert.equal(reset.onboardingComplete, false);
  assert.equal(reset.workoutHistory.length, 0);
  assert.equal(await store.getItem('unrelated'), 'keep');
});
test('storage errors and unreadable saved state fail explicitly rather than silently resetting', async () => {
  const store = storage({ [p.STORAGE_KEY]: 'not json' });
  await assert.rejects(() => p.loadProgress(store));
  await assert.rejects(() => p.loadProgress({ getItem: async () => { throw new Error('storage unavailable'); } }), /storage unavailable/);
});
test('whole roadmap traverses in order, reaches goal honestly and finishes without orphan lessons', () => {
  let state = placed();
  for (const lesson of lessons) {
    assert.equal(track.getNextLesson(p.creditedIds(state)).lesson.id, lesson.id);
    state = p.recordSession(state, input(lesson.id, { actualSuccess: !!lesson.requiresSuccess }));
  }
  assert.equal(track.getNextLesson(p.creditedIds(state)), null);
  assert.equal(state.completedLessonIds.length, lessons.length);
  assert.equal(state.workoutHistory.length, lessons.length);
  for (const phase of phases) assert.equal(track.getNodeStatus(phase.id, p.creditedIds(state)), 'completed');
});
test('mixed base sessions retain a small fixed back-off dose, not full-volume duplicate pulling', () => {
  assert.equal(lessons.length, 71);
  for (const lesson of phases[1].lessons) {
    assert.equal(lesson.exercises.length, 3);
    const backoff = lesson.exercises.find(ex => ex.name === 'Assisted Pull-ups');
    assert.deepEqual(backoff.targets, [2]);
    assert.equal(backoff.variation, 'easy back-off assistance');
    const supportingHold = lesson.exercises.find(ex => ex.unit === 'seconds');
    assert.deepEqual(supportingHold.targets, lesson.id === 'bar-v2-base-1' ? [10] : [5]);
    assert.match(lesson.plateau, /assistance/);
    assert.match(lesson.plateau, /unmet/);
    assert.match(lesson.plateau, /practice, not mastery/);
  }
});
test('support skills and pulling development alternate without increasing both prescriptions', () => {
  const phase = phases[2];
  const growth = phase.lessons.filter(l => l.id.startsWith('bar-v2-strength-'));
  assert.equal(growth.length, 9);
  assert.deepEqual(growth.map(l => l.exercises[0].targets), [
    [6, 5, 5], [6, 6, 5], [6, 6, 6], [7, 6, 6], [7, 7, 6], [7, 7, 7], [8, 7, 7], [8, 8, 7], [8, 8, 8],
  ]);
  for (let i = 1; i < phase.lessons.length; i++) {
    const current = phase.lessons[i], previous = phase.lessons[i - 1];
    const pull = current.exercises.find(ex => ex.name === 'Strict Pull-ups');
    const previousPull = previous.exercises.find(ex => ex.name === 'Strict Pull-ups');
    if (current.id.startsWith('bar-v2-strength-')) {
      assert.equal(current.focus, 'Strict Pull-ups');
      const fixed = current.exercises.find(ex => ex.name !== 'Strict Pull-ups');
      const previousFixed = previous.exercises.find(ex => ex.name !== 'Strict Pull-ups');
      assert.equal(fixed.name, previousFixed.name);
      assert.deepEqual(fixed.targets, previousFixed.targets);
      assert.equal(fixed.variation, previousFixed.variation);
      assert.equal(pull.targets.reduce((a, b) => a + b) - previousPull.targets.reduce((a, b) => a + b), 1);
    } else assert.deepEqual(pull.targets, previousPull.targets);
  }
});
test('single-exercise exceptions are limited to first grip exposure and fresh attempts/successes', () => {
  for (const lesson of lessons) {
    if (lesson.exercises.length === 1) assert.match(lesson.id, /bar-v2-(grip-|attempt-|success-)/);
  }
});
test('previous simplified-roadmap state resets once, then mixed-roadmap placement persists', async () => {
  const store = storage({
    [p.PREVIOUS_STORAGE_KEY]: JSON.stringify({ version: 2, onboardingComplete: true, completedLessonIds: ['bar-v2-base-14'], assessedLessonIds: [], workoutHistory: [], streak: 0 }),
    unrelated: 'keep',
  });
  const initial = await p.loadProgress(store);
  assert.equal(initial.version, 3);
  assert.equal(initial.onboardingComplete, false);
  assert.equal(initial.rebuildNotice, true);
  assert.deepEqual(initial.completedLessonIds, []);
  assert.equal(await store.getItem(p.PREVIOUS_STORAGE_KEY), null);
  assert.deepEqual(await p.loadProgress(store), initial);
  const saved = p.placeUser(initial, { ...track.EMPTY_PLACEMENT, pullUps: 5, repeatableFives: true });
  await store.setItem(p.STORAGE_KEY, JSON.stringify(saved));
  assert.deepEqual(await p.loadProgress(store), saved);
  assert.equal(track.getNextLesson(p.creditedIds(saved)).lesson.id, 'bar-v2-support-1');
  assert.equal(await store.getItem('unrelated'), 'keep');
});
test('every higher-pulls workout keeps a fixed reduced pulling and dip base after height practice', () => {
  const higher = phases.find(phase => phase.id === 'higher-pulls');
  for (const lesson of higher.lessons) {
    assert.equal(lesson.exercises.length, 3);
    assert.equal(lesson.focus, lesson.exercises[0].name);
    assert.equal(lesson.exercises[1].name, 'Strict Pull-ups');
    assert.deepEqual(lesson.exercises[1].targets, [4, 4]);
    assert.equal(lesson.exercises[2].name, 'Straight-Bar Dips');
    assert.deepEqual(lesson.exercises[2].targets, [2, 2]);
    assert.equal(lesson.exercises[1].restSeconds, 180);
    assert.equal(lesson.exercises[2].restSeconds, 180);
    assert.equal(lesson.exercises[0].restSeconds, lesson.id.startsWith('bar-v2-high-') ? 240 : 180);
    assert.match(lesson.change, /supporting work/);
    assert.match(lesson.plateau, /height or speed fades/);
  }
  const first = higher.lessons[0];
  assert.deepEqual(first.exercises[0].targets, [1, 1, 1]);
  assert.equal(first.exercises.reduce((total, ex) => total + ex.targets.length, 0), 7);
  assert.deepEqual(higher.lessons.slice(0, 5).map(lesson => lesson.exercises[0].targets),
    [[1, 1, 1], [2, 1, 1], [2, 2, 1], [2, 2, 2], [1, 1]]);
  assert.deepEqual(higher.lessons.slice(5).map(lesson => lesson.exercises[0].targets),
    [[1], [1, 1], [1, 1, 1], [1], [1, 1], [1, 1, 1]]);
});
