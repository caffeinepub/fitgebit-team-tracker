# Specification

## Summary
**Goal:** Allow Assistants and Managers to edit a task’s title, description, and type while keeping completion state and history unchanged.

**Planned changes:**
- Backend: add an authenticated task update API/method to edit title/description/taskType by taskId with non-empty validation and a clear “Task not found” error for missing IDs.
- Backend: ensure edits do not modify completion-related fields (isCompleted, currentCompletion, lastResetAt, nextResetTimestamp) and that existing task-returning endpoints reflect updated fields without losing completion info.
- Frontend: add an Edit action on each task to open a pre-filled Edit Task dialog and save via a new React Query mutation, refreshing the tasks list on success and surfacing errors via existing notification handling.
- Frontend: add/adjust i18n keys for new task-editing UI text (EN/NL/FR), with all new user-facing strings using i18n.

**User-visible outcome:** Assistants and Managers can edit a task’s title, description, and type from the task list, and completed tasks keep their completion badge and completion details exactly as before.
