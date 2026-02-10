# Specification

## Summary
**Goal:** Restore a reliable authenticated profile experience and rebuild avatar handling to support initials, optional uploaded profile photos, and consistent dental avatars across the app.

**Planned changes:**
- Fix authenticated app flow so exactly one of LoginScreen, RoleChoiceScreen, ProfileOnboardingModal, or AppShell deterministically renders based on auth/role/profile state, with a visible error + retry fallback when role/profile queries fail.
- Extend the backend UserProfile model to store initials (2–3 chars) and an optional profile photo blob reference while keeping existing dental avatar selection as a fallback; add migration for existing profiles.
- Add authenticated backend APIs for profile photo upload/retrieval/deletion using existing blob storage, with image-only and size-limit validation and owner-only access controls.
- Update profile onboarding to require username + initials and allow choosing: upload photo, select dental SVG avatar, or use an auto-generated pastel dental avatar with initials; prevent saving until inputs are valid.
- Update Profile Settings to edit username/initials and manage avatar/photo (upload/replace/remove) with correct fallback behavior; ensure the settings sheet remains fully opaque in light/dark modes.
- Implement a single reusable avatar renderer component (photo → dental SVG → auto-generated pastel avatar with initials) and update all profile avatar usages (e.g., header, manager picker, task/manager views) to use it.
- Ensure dental avatar availability is reliable by initializing and guaranteeing `getAllDentalAvatars()` consistently returns 16 entries (self-heal or return clear error, no silent empty grid).
- Add/update i18n keys (EN/NL/FR) for all new/changed profile and photo-upload text, and remove outdated/unreachable role-confirmation strings.

**User-visible outcome:** After login, the app always shows the correct screen (with clear errors and retry if data fails). Users can complete onboarding with a name and initials, choose a dental avatar or auto-generated initials avatar, optionally upload a profile photo, and see their avatar/photo render reliably everywhere in the app.
