const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { build } = require('esbuild');
const { chromium } = require('playwright-core');

const executablePath = process.env.CHROMIUM_PATH || '/repl/tools/bin/chromium';

// Use the actual RN Web Pressable in Chromium, not a mocked onKeyDown.
// The browser supplies native button defaults and the complete key lifecycle.
test('web disclosures toggle once on Space/Enter/touch and expose state without scrolling', {
  skip: fs.existsSync(executablePath) ? false : 'Set CHROMIUM_PATH to run the real-browser keyboard regression.',
}, async () => {
  const bundle = await build({
    stdin: {
      contents: `
        import React from 'react';
        import {createRoot} from 'react-dom/client';
        import {Disclosure} from './components/TrainingUI';
        createRoot(document.getElementById('root')).render(
          <Disclosure title="Form and demo"><a href="#demo">Find a demo</a></Disclosure>
        );`,
      resolveDir: path.resolve(__dirname, '..'),
      loader: 'tsx',
    },
    write: false, bundle: true, platform: 'browser', format: 'iife',
    define: { 'process.env.NODE_ENV': '"test"' },
    plugins: [{
      name: 'native-web-test-boundaries',
      setup(builder) {
        builder.onResolve({ filter: /^react-native$/ }, () => ({ path: require.resolve('react-native-web') }));
        // Stub only app theme and noninteractive native/icon dependencies.
        builder.onResolve({ filter: /^(@\/hooks\/useColors|react-native-safe-area-context|@expo\/vector-icons)$/ },
          args => ({ path: args.path, namespace: 'test-boundary' }));
        builder.onLoad({ filter: /.*/, namespace: 'test-boundary' }, args => ({
          contents: args.path === '@/hooks/useColors'
            ? 'export const useColors = () => ({card:"#222",foreground:"#fff",mutedForeground:"#aaa"});'
            : args.path === '@expo/vector-icons'
              ? 'export const Ionicons = () => null;'
              : 'export const SafeAreaView = () => null;',
        }));
      },
    }],
  });
  const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 }, hasTouch: true });
    await page.setContent('<div id="root"></div><div style="height:2000px"></div>');
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const button = page.getByRole('button', { name: 'Form and demo', exact: true });
    await button.waitFor();
    await button.focus();
    assert.equal(await button.getAttribute('aria-expanded'), 'false');
    assert.equal(await page.getByRole('link').count(), 0);
    await page.evaluate(() => {
      window.expandedChanges = [];
      new MutationObserver(records => {
        for (const record of records) {
          if (record.attributeName === 'aria-expanded') {
            window.expandedChanges.push(record.target.getAttribute('aria-expanded'));
          }
        }
      }).observe(document.querySelector('button'), { attributes: true });
    });
    for (const key of ['Space', 'Space', 'Enter', 'Enter']) {
      const before = await button.getAttribute('aria-expanded');
      const scrollBefore = await page.evaluate(() => window.scrollY);
      const changesBefore = await page.evaluate(() => window.expandedChanges.length);
      await page.keyboard.down(key);
      await page.keyboard.up(key);
      const expected = before === 'false' ? 'true' : 'false';
      await page.waitForFunction(value => document.querySelector('button').getAttribute('aria-expanded') === value, expected);
      assert.equal(await button.getAttribute('aria-expanded'), expected);
      assert.equal(await page.evaluate(() => window.expandedChanges.length), changesBefore + 1);
      assert.equal(await page.evaluate(() => window.scrollY), scrollBefore, `${key} must not scroll the page`);
      assert.equal(await page.getByRole('link').count(), expected === 'true' ? 1 : 0);
    }
    await button.tap();
    assert.equal(await button.getAttribute('aria-expanded'), 'true');
    await button.tap();
    assert.equal(await button.getAttribute('aria-expanded'), 'false');
  } finally {
    await browser.close();
  }
});
