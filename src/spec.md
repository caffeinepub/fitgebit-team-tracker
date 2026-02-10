# Specification

## Summary
**Goal:** Fix dental avatar rendering throughout the app, add multi-line task descriptions, and display overtime totals as days/hours/minutes instead of raw minutes.

**Planned changes:**
- Fix rendering and fallback behavior for the 16 dental SVG avatars so they reliably display in the avatar picker, profile onboarding/settings, header/user menu, and manager user picker without console errors.
- Add a multi-line task description field directly under the task title in the Create Task flow; persist the description in the backend task model, return it from task APIs, and render it under the title on task cards (treat missing descriptions on older tasks as empty).
- Update overtime totals formatting to convert summed signed minutes into a composite display using 60 minutes = 1 hour and 8 hours = 1 day, showing “X day(s), Y hour(s), Z minute(s)” with correct handling for negative totals (leading minus sign with absolute components).

**User-visible outcome:** Avatars consistently appear everywhere they are shown, users can add and see detailed multi-line task descriptions, and overtime totals are easier to read as days/hours/minutes (including for negative totals).
