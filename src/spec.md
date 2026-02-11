# Specification

## Summary
**Goal:** Update overtime totals/conversion displays so that one full workday equals 7h30 (450 minutes) instead of 8h (480 minutes) everywhere in the app.

**Planned changes:**
- Change all UI logic that converts overtime minutes into workdays to use 450 minutes per day, including composite totals formatted as “X day(s), Y hour(s), Z minute(s)”.
- Ensure the updated conversion is applied consistently across Assistant and Manager overtime views and any other UI that derives days from minutes.
- Keep composite formatting rules intact (60 minutes = 1 hour) and preserve negative total display with a leading “-”.
- Apply the new conversion rule to historical overtime totals automatically (no re-entry required; refresh is sufficient).

**User-visible outcome:** All overtime totals and composite day/hour/minute displays reflect 7h30 per workday across the app (including existing entries), consistently for both Assistants and Managers.
