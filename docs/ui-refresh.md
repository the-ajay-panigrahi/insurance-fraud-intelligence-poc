# UI refresh

15 November 2026. Baseline: `a0a2ece9b4b16561612138f0442f4420b618095e`.

Adapted from the accompanying OpenDesignMD reference. Existing project stack, copy, data, routing, authentication and business logic are preserved. Application changes are a presentation stylesheet and its import only. No new runtime dependency. Existing dark themes and reduced-motion preferences are retained. Original reference assets/fonts/logos are not copied.

Verified: `npm run build --prefix client` passed after the final stylesheet revision. Desktop/mobile Chromium checks passed for login rendering, responsive width and filling the built-in demo credentials button. No sign-in or investigation write was performed against the live database during these checks. Business source hashes match the baseline after removing the single CSS import. Backend, risk scoring, records and graph logic are unchanged.

The user authorized commit/push; existing Render deployment verification is tracked in Portfolio V3 context/ui-refresh-status.md.
