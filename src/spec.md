# Specification

## Summary
**Goal:** Polish key UI elements by improving dialog readability, cleaning up wording, simplifying branding text, and ensuring avatars reliably display.

**Planned changes:**
- Make the Task Create and Task Completion dialogs fully opaque in both light and dark mode.
- Remove the word “optional” from all Tasks and Overtime user-facing labels/placeholders/helper text while keeping the fields optional, and keep strings routed through i18n.
- Simplify branding so only “FitGebit” is shown next to/under the logo in the header and login screen (remove any subtitle/secondary text), driven by i18n.
- Fix the avatar picker so the existing 16 dental avatars consistently render in the grid and ensure any empty-state messaging is translated via i18n.

**User-visible outcome:** Task dialogs are easier to read (no transparency), Tasks/Overtime screens no longer show “optional” text, the app branding displays only “FitGebit” in header and login, and the avatar picker reliably shows the existing avatar options.
