# Specification

## Summary
**Goal:** Update the Overtime tracker to remove all photo handling and improve date/color semantics, and redesign Tasks around shared recurring types with completion tracking, reset-on-open behavior, and manager reporting/export updates.

**Planned changes:**
- Remove overtime photo support end-to-end (no upload/view; backend does not accept/store/return photo data; legacy entries render safely without photos).
- Update overtime date entry UX to DD MM YYYY (prefilled to today) and block future dates with a visible validation error.
- Ensure overtime add/deduct actions and history semantics match: Add shows red +minutes, Deduct shows green -minutes; totals compute net minutes and show workdays where 480 minutes = 1 day.
- Redesign Tasks model and UI to only include Title + Type (weekly/monthly/urgent), with tasks being shared and with no due date/assignee/priority.
- Implement task type-based coloring (weekly blue, monthly yellow, urgent red) and completed state as green “done” until reset.
- Implement recurring/reset logic evaluated on app open/load: weekly resets on/after Monday boundary; monthly resets on/after the first Monday of the month; define and document urgent reset behavior in code comments.
- Add task completion tracking: record completer, optional comment, and optional before-and-after photos; show camera/photo icons and completion details in the UI without broken images when photos are absent.
- Update manager task stats and CSV export to align with the new task model and completion tracking (who completed tasks and how often), and keep export functional.

**User-visible outcome:** Users can log overtime without photos using a DD MM YYYY date input and see correctly colored add/deduct history and totals. Users can manage shared weekly/monthly/urgent tasks that reset when the app opens, mark tasks done with optional comment and before/after photos, and managers can view completion-focused stats and download an updated CSV export.
