---
name: Web disclosure accessibility
description: Cross-platform expanded-state behavior observed in the Expo web preview
---

Expose disclosure state with explicit `aria-expanded` as well as native `accessibilityState.expanded`.

**Why:** A browser check found the native accessibility state was not projected to an `aria-expanded` attribute by this app’s React Native Web runtime. A button could toggle visually while its state was unavailable to web screen readers.

**How to apply:** For future expandable controls, check the actual DOM state instead of assuming native accessibility props map to web ARIA. Keep keyboard focus on the disclosure when verifying Enter and Space activation.

Do not infer a broken Space handler from the testing assistant's `page.keyPress('Space')` alone.

**Why:** In this environment both that call and literal-space input produced an empty DOM key/code with keyCode 0. Direct Chromium keyboard down/up events correctly activated the real React Native Web button.

**How to apply:** Verify the emitted event and the full keydown/keyup lifecycle, including native button defaults. Prefer the real-browser disclosure regression over a mock that invokes only a custom keydown handler.
