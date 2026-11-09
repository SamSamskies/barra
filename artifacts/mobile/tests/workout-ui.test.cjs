const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Dependency-free component harness: executes the real TSX and event handlers.
// Native hosts are inert; browser keyboard/layout behavior is checked separately.
function harness(id = 'bar-v2-grip-1') {
  const root = path.resolve(__dirname, '..');
  const modules = new Map(), instances = new Map();
  let active, cursor, params = { id }, tree, route = 'workout/[id]';
  const navigation = [], saves = [];
  let app;
  const React = {
    createElement: (type, props, ...children) => ({ type, props: { ...props, children }, key: props?.key }),
    useState(initial) {
      const hooks = active, slot = cursor++;
      if (!(slot in hooks)) hooks[slot] = typeof initial === 'function' ? initial() : initial;
      return [hooks[slot], value => { hooks[slot] = typeof value === 'function' ? value(hooks[slot]) : value; }];
    },
    useRef(initial) {
      const hooks = active, slot = cursor++;
      return hooks[slot] ??= { current: initial };
    },
    useEffect() {}, // Timer progression is not simulated; rest buttons are real.
  };
  const hosts = Object.fromEntries(['Text', 'View', 'Pressable', 'ScrollView'].map(name => [name, name]));
  const native = { ...hosts, Platform: { OS: 'web' }, StyleSheet: { create: s => s }, Linking: { openURL: async () => {} } };
  function load(file) {
    if (modules.has(file)) return modules.get(file);
    const mod = { exports: {} };
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React, esModuleInterop: true },
    }).outputText;
    new Function('require', 'module', 'exports', code)(name => {
      if (name === 'react') return React;
      if (name === 'react-native') return native;
      if (name === 'react-native-safe-area-context') return { SafeAreaView: 'SafeAreaView' };
      if (name === '@expo/vector-icons') return { Ionicons: 'Ionicons' };
      if (name === 'expo-router') return { useLocalSearchParams: () => params, router: { replace: p => navigation.push(p) }, Redirect: 'Redirect' };
      if (name === '@/hooks/useColors') return { useColors: () => ({ primary: 'green', foreground: 'white', card: 'black' }) };
      if (name === '@/context/AppContext') return { useApp: () => app };
      const resolved = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(file), name);
      return load(['.ts', '.tsx'].map(ext => resolved + ext).find(fs.existsSync));
    }, mod, mod.exports);
    modules.set(file, mod.exports);
    return mod.exports;
  }
  const track = load(path.join(root, 'constants/track.ts'));
  const progression = load(path.join(root, 'lib/progression.ts'));
  const copy = load(path.join(root, 'constants/workoutCopy.ts'));
  const index = track.ALL_LESSONS.findIndex(l => l.id === id);
  app = {
    state: { ...progression.freshState(), onboardingComplete: true, loading: false, assessedLessonIds: track.ALL_LESSONS.slice(0, index).map(l => l.id) },
    async saveSession(input) {
      if (app.failSave) throw new Error('storage unavailable');
      saves.push(input);
      app.state = progression.recordSession(app.state, input);
    },
    async uncompleteLesson(lessonId) { app.state = progression.undoCredit(app.state, lessonId); },
  };
  function render() {
    const seen = new Set();
    function visit(element, position) {
      if (element == null || typeof element === 'boolean') return null;
      if (Array.isArray(element)) return element.map((child, i) => visit(child, `${position}/${child?.key ?? i}`));
      if (typeof element !== 'object') return element;
      if (typeof element.type === 'function') {
        const key = `${position}:${element.type.name}:${element.key ?? ''}`;
        seen.add(key);
        active = instances.get(key) ?? [];
        instances.set(key, active);
        cursor = 0;
        return visit(element.type(element.props), key);
      }
      return { ...element, children: visit(element.props.children, `${position}/children`) };
    }
    tree = visit(React.createElement(load(path.join(root, `app/${route}.tsx`)).default), 'root');
    for (const key of instances.keys()) if (!seen.has(key)) instances.delete(key);
    return tree;
  }
  function nodes(node = tree) {
    if (Array.isArray(node)) return node.flatMap(n => nodes(n));
    if (!node || typeof node !== 'object') return [];
    return [node, ...nodes(node.children)];
  }
  function text(node = tree) {
    if (Array.isArray(node)) return node.map(n => text(n)).join(' ');
    if (node == null) return '';
    return typeof node === 'object' ? text(node.children) : String(node);
  }
  const button = label => nodes().find(n => n.type === 'Pressable' && n.props.accessibilityLabel === label);
  const press = label => {
    const found = button(label);
    assert.ok(found, `Missing button: ${label}`);
    assert.ok(!found.props.disabled, `Disabled button: ${label}`);
    const result = found.props.onPress();
    render();
    return result;
  };
  render();
  return { app, track, copy, progression, saves, navigation, render, nodes, text, button, press,
    complete() { params = { sessionId: app.state.workoutHistory[0]?.id }; route = 'workout/complete'; render(); },
    changeId(next) { params = { id: next }; render(); },
  };
}

test('all previews retain exact targets, rest, setup and visible critical cues before optional reading', () => {
  const { track } = harness();
  for (const lesson of track.ALL_LESSONS) {
    const h = harness(lesson.id);
    const visible = h.text();
    assert.match(visible, /Stop for pain or loss of control/);
    assert.match(visible, /secure, load-rated/);
    assert.ok(visible.includes(h.copy.focusSummary(lesson)));
    for (const ex of lesson.exercises) {
      assert.ok(visible.includes(track.formatTargets(ex)), lesson.id);
      assert.match(visible, new RegExp(`${ex.restSeconds}\\s*s rest`), lesson.id);
      assert.ok(visible.includes(h.copy.movementCue(ex)), ex.name);
      if (ex.variation !== 'standard') assert.ok(visible.includes(ex.variation));
      if (h.copy.needsPlatform(ex)) assert.ok(visible.includes(h.copy.PLATFORM_CUE));
    }
    assert.ok(!visible.includes(lesson.plateau));
    assert.ok(h.button('Begin workout'));
    assert.ok(h.nodes().filter(n => n.props.accessibilityState?.expanded !== undefined).every(n => !n.props.accessibilityState.expanded));
    assert.ok(visible.indexOf('Begin workout') < visible.indexOf('Form & demo:'));
    h.press('Begin workout');
    assert.ok(h.text().includes(h.copy.movementCue(lesson.exercises[0])));
    const circle = h.nodes().find(n => n.props.testID === 'current-target-circle');
    assert.ok(circle);
    assert.match(h.text(circle), new RegExp(`${lesson.exercises[0].targets[0]}\\s+${track.formatTargetUnit(lesson.exercises[0], lesson.exercises[0].targets[0])}`));
    assert.match(h.text(), /Stop for pain or loss of control/);
    assert.ok(!h.button(`Find a demo: ${lesson.exercises[0].name}`));
    if (h.copy.needsPlatform(lesson.exercises[0])) assert.ok(h.text().includes(h.copy.PLATFORM_CUE));
  }
});

test('mixed movement changes show the next target, setup and cue, with details closed', () => {
  const h = harness('bar-v2-base-2');
  h.press('Begin workout');
  h.press('Form & demo: Strict Pull-ups');
  h.press('Target completed with control');
  h.press('Skip rest');
  h.press('Target completed with control');
  h.press('Skip rest');
  assert.match(h.text(), /Assisted Pull-ups/);
  assert.match(h.text(), /2\s+reps/);
  assert.match(h.text(), /easy back-off assistance/);
  assert.match(h.text(), /safe stable platform/);
  assert.equal(h.button('Form & demo: Assisted Pull-ups').props.accessibilityState.expanded, false);
  h.press('Target unmet / skip this set');
  h.press('Skip rest');
  assert.match(h.text(), /Supported Straight-Bar Support/);
  assert.match(h.text(), /5\s+sec/);
  assert.match(h.text(), /Keep feet loaded/);
  h.press('Target completed with control');
  assert.match(h.text(), /1\s+sets skipped or unmet/);
  assert.ok(!h.button('All targets completed with control'));
});

test('details toggle with meaningful button labels and expanded state, without navigation or progress', () => {
  const h = harness('bar-v2-base-2');
  const lesson = h.track.getLessonById('bar-v2-base-2').lesson;
  const label = `Form & demo: ${lesson.exercises[0].name}`;
  assert.equal(h.button(label).props.accessibilityRole, 'button');
  assert.equal(h.button(label).props.accessibilityState.expanded, false);
  assert.equal(h.button(label).props['aria-expanded'], false);
  assert.ok(h.nodes().some(n => n.type === 'Ionicons' && n.props.name === 'chevron-down'));
  assert.ok(!h.button(`Find a demo: ${lesson.exercises[0].name}`));
  h.press(label);
  assert.equal(h.button(label).props.accessibilityState.expanded, true);
  assert.equal(h.button(label).props['aria-expanded'], true);
  assert.ok(h.nodes().some(n => n.type === 'Ionicons' && n.props.name === 'chevron-up'));
  assert.ok(h.text().includes(lesson.exercises[0].description));
  assert.ok(h.button(`Find a demo: ${lesson.exercises[0].name}`));
  h.press(label);
  assert.equal(h.button(label).props.accessibilityState.expanded, false);
  h.press('Target help & plateau advice');
  assert.ok(h.text().includes(lesson.plateau));
  assert.deepEqual(h.saves, []);
  assert.deepEqual(h.navigation, []);
  h.press('Begin workout');
  assert.equal(h.button(label).props.accessibilityState.expanded, false);
  assert.match(h.text(), /Set\s+1\s+of\s+2/);
  assert.doesNotMatch(h.text(), /All set targets/);
  h.press(label);
  h.press('Cannot reach this target?');
  assert.match(h.text(), /Assistance for a strict target/);
  h.press('Target completed with control');
  assert.match(h.text(), /180\s*s/);
  h.press('Add 60 seconds rest');
  assert.match(h.text(), /240\s*s/);
  h.press('Skip rest');
  assert.equal(h.button(label).props.accessibilityState.expanded, false);
  assert.equal(h.button('Cannot reach this target?').props.accessibilityState.expanded, false);
  assert.match(h.text(), /Set\s+2\s+of\s+2/);
  h.changeId('bar-v2-grip-1');
  assert.ok(h.button('Repeat this workout'), 'Changing workouts resets execution; earlier placed steps remain repeats');
});

test('locked previews cannot start; assessed repeats and undo keep real history', async () => {
  const h = harness('bar-v2-grip-2');
  h.app.state.assessedLessonIds = [];
  h.render();
  assert.match(h.text(), /Locked · preview only/);
  assert.ok(!h.button('Begin workout'));
  h.press('Targets, readiness & progression');
  assert.deepEqual(h.saves, []);
  h.app.state.assessedLessonIds = ['bar-v2-grip-1', 'bar-v2-grip-2'];
  h.render();
  h.press('Repeat this workout');
  h.press('Target completed with control');
  await h.press('All targets completed with control');
  assert.equal(h.app.state.workoutHistory[0].outcome, 'repeat');
  h.complete();
  assert.match(h.text(), /no duplicate lesson credit/);
  // A new instance represents reopening the completed preview.
  const undo = harness('bar-v2-grip-2');
  undo.app.state = h.app.state;
  undo.render();
  assert.ok(undo.button('Repeat this workout'));
  undo.press('Remove credit from this step onward');
  await undo.press('Remove credit, keep session history');
  assert.equal(undo.app.state.workoutHistory.length, 1);
  assert.deepEqual(undo.app.state.completedLessonIds, []);
});

test('unmet and early-ended sets save practice; errors allow retry; result guidance stays optional', async () => {
  for (const endDuringRest of [false, true]) {
    const h = harness('bar-v2-base-1');
    h.press('Begin workout');
    if (endDuringRest) h.press('Target completed with control');
    h.press('End early and record practice');
    assert.ok(!h.button('All targets completed with control'));
    assert.match(h.text(), new RegExp(`${endDuringRest ? 3 : 4}\\s+sets skipped or unmet`));
    h.app.failSave = true;
    await h.press('Save as practice — stay at this step');
    h.render();
    assert.match(h.text(), /Could not save your session/);
    assert.deepEqual(h.navigation, []);
    h.app.failSave = false;
    await h.press('Save as practice — stay at this step');
    assert.equal(h.saves.length, 1);
    assert.equal(h.saves[0].targetsMet, false);
    h.complete();
    assert.match(h.text(), /Practice recorded/);
    assert.match(h.text(), /mark missed, substituted or shortened sets unmet/);
    const plateau = h.track.getLessonById('bar-v2-base-1').lesson.plateau;
    assert.ok(!h.text().includes(plateau));
    h.press('Practice & target help');
    assert.ok(h.text().includes(plateau));
    assert.ok(!h.nodes().some(n => n.props.accessibilityLabel?.startsWith('Preview next:')));
  }
  const h = harness();
  h.press('Begin workout');
  h.press('Target unmet / skip this set');
  await h.press('Save as practice — stay at this step');
  assert.equal(h.saves[0].skippedSets, 1);
  assert.equal(h.app.state.workoutHistory[0].outcome, 'practice');
});

test('attempt completion is not success; actual muscle-up confirmation remains explicit', async () => {
  for (const id of ['bar-v2-attempt-1', 'bar-v2-success-1', 'bar-v2-success-3']) {
    const h = harness(id), lesson = h.track.getLessonById(id).lesson;
    h.press('Begin workout');
    for (let i = 0; i < lesson.exercises[0].targets.length; i++) {
      h.press(id.includes('attempt') ? 'Controlled attempt taken' : 'Target completed with control');
      if (h.button('Skip rest')) h.press('Skip rest');
    }
    h.press('Readiness details');
    assert.ok(h.text().includes(lesson.readiness));
    if (lesson.requiresSuccess) {
      assert.match(h.text(), /Failed attempts, banded reps or one-arm turnovers do not count/);
      await h.press('Yes — actual controlled muscle-up success');
      assert.equal(h.saves[0].actualSuccess, true);
    } else {
      assert.match(h.text(), /not the muscle-up goal/);
      await h.press('All prescribed attempts were safe and controlled');
      assert.equal(h.saves[0].actualSuccess, false);
    }
    h.complete();
    assert.match(h.text(), lesson.requiresSuccess && id.endsWith('1') ? /First muscle-up achieved/ : lesson.requiresSuccess ? /Step completed with control/ : /not the muscle-up goal/);
  }
});

test('attempt repeats still explicitly say they are not actual muscle-up success', async () => {
  const h = harness('bar-v2-attempt-1');
  h.app.state.assessedLessonIds.push('bar-v2-attempt-1');
  h.render();
  h.press('Repeat this workout');
  h.press('Controlled attempt taken');
  h.press('Skip rest');
  h.press('Controlled attempt taken');
  await h.press('All prescribed attempts were safe and controlled');
  h.complete();
  assert.match(h.text(), /Attempt-practice repeat recorded/);
  assert.match(h.text(), /not the muscle-up goal/);
  assert.equal(h.saves[0].actualSuccess, false);
});
