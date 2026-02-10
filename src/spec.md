# Specification

## Summary
**Goal:** Ensure weekly and monthly task completion persists across refresh/reopen until the next scheduled reset boundary (weekly: Monday; monthly: first Monday) or a manual reset, with the backend as the source of truth.

**Planned changes:**
- Update backend recurring reset logic to only reset weekly/monthly tasks when the relevant reset boundary has passed, and never reset urgent tasks.
- Ensure `getTasks()` continues to return persisted completion state (`isCompleted=true`) for weekly/monthly tasks until a legitimate scheduled reset or manual reset occurs.
- Update the frontend so opening the Tasks page does not cause premature resets; the UI reflects backend state and only changes after a backend-determined reset or a user manual reset.
- Adjust frontend behavior on reset failure to keep displaying previously fetched completion states (no forced local flip).

**User-visible outcome:** Completed weekly/monthly tasks remain marked as done after refresh/reopen until the next weekly/monthly reset boundary (or manual reset), and urgent tasks stay completed until manually reset.
