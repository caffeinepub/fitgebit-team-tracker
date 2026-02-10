# Specification

## Summary
**Goal:** Allow assistants to log overtime for a selected date within the past 2 months (including today) using a date picker, with consistent frontend and backend validation and storage.

**Planned changes:**
- Update the overtime entry date UI to keep the existing editable DD/MM/YYYY inputs while opening a calendar date picker when the date field/area is clicked.
- Restrict selectable dates in the date picker to the inclusive range from today back to 2 months ago; prevent future dates and dates older than 2 months.
- Add/adjust frontend validation to block submission for dates older than 2 months with an English error message, while preserving the existing future-date error behavior.
- Update the backend overtime create API to accept a caller-provided date, store it on the overtime entry, and enforce server-side validation for future/too-old dates with English error/trap messages.
- Wire the frontend create-overtime request to send the selected/entered date to the backend and ensure OvertimeHistory shows the stored chosen date after submission.

**User-visible outcome:** Assistants can pick (or manually type) an overtime date within the last 2 months using a calendar picker, submit it successfully, and see the selected date reflected in overtime history; invalid dates are rejected with clear English errors.
