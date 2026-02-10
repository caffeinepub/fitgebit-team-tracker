# Specification

## Summary
**Goal:** Replace the current auto-assigned manager flow with an explicit Assistant/Manager role-choice login (Manager requires token), tighten first-login profile validation, switch to 16 canister-served SVG dental avatars, and update login branding to a tooth icon.

**Planned changes:**
- Add an explicit post–Internet Identity role-choice step (Assistant or Manager); require token `ICPmaxi313` to proceed as Manager and show an error on invalid token.
- Remove/disable the legacy “first user becomes Manager” behavior and ensure the old first-manager confirmation dialog is never shown; route unconfigured users to the new role-choice step.
- Update backend authorization to persist the selected role per principal, and to grant Manager/admin privileges only after successful Manager token setup; block manager-only endpoints for non-Managers.
- Revise the login UI to include role selection and conditional token entry while keeping Internet Identity authentication.
- Update profile onboarding to require username plus initials of length 2–3 characters; keep initials stored uppercase and block saving with invalid initials.
- Replace the existing 48-avatar manifest and paginated picker with exactly 16 simple cute dental SVG avatars stored in the canister; fetch and render them in a single grid with no pagination; ensure SVGs reliably load and existing avatar display uses canister-served data.
- Add/adjust i18n keys for any new/changed user-facing strings (en/nl/fr) for the role/token flow and onboarding validation.
- Replace the login screen Sparkles icon with a static cute tooth icon logo (no text) that works in light/dark modes.

**User-visible outcome:** After authenticating with Internet Identity, users choose to continue as Assistant or Manager (Managers must enter the `ICPmaxi313` token). New users must enter a username and 2–3 character initials to complete onboarding, and avatar selection shows a single grid of 16 cute dental SVG options that load reliably.
