# Specification

## Summary
**Goal:** Make task completion actions clearer by showing the task title in the “mark done” dialog and provide Assistants with a visible per-task reset control to set completed tasks back to not done.

**Planned changes:**
- Update the task completion (mark-done) dialog to include the current task’s title as a smaller subtitle-style line near the top (not the main dialog title), matching the task card title and preserving full opacity in light/dark mode.
- Add a clearly visible per-task reset button/control on task cards for Assistants in the task list, available wherever the task list is shown.
- Wire the reset control to the existing `resetTask` mutation/hooks so that, after success, the task updates to “not completed” in the list while keeping existing React Query caching behavior intact.
- Add any new user-facing reset label(s) via the existing i18n system with English text (e.g., `tasks.resetTask`).

**User-visible outcome:** When marking a task done, users see the task title in the confirmation dialog, and Assistants can reset any completed task directly from its task card to make it incomplete again.
