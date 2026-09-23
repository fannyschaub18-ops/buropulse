# AGENTS.md — BuroPulse (Wix Velo)

## Project Overview
This is a **Wix Velo** site for BuroPulse (administrative assistance business). The repo uses the Wix CLI (`wix dev`) which requires Wix cloud authentication and cannot run standalone in Docker.

## How the Preview Works
The entire website is self-contained in a **custom element**: `src/public/custom-elements/buropulse-site.js`. It renders all HTML, CSS, and interactive JS (wizard, contact form, modals, mobile menu) into a Shadow DOM.

- `index.html` (repo root) loads the custom element and provides a `<buropulse-site>` host.
- `server.js` is a minimal Node.js static file server (no dependencies) on port 3000.
- The contact form's `bp-submit` event is handled in `index.html` — it simulates a successful submission (in Wix, page code calls the `envoyerDemande` backend web method).
- Content defaults are embedded in the custom element; the `bp-content` attribute can override them (in Wix, page code calls `getContenu`).

## Architecture
- `src/public/custom-elements/buropulse-site.js` — the entire site (custom element with HTML/CSS/JS)
- `src/backend/buropulse.web.js` — Wix backend web methods (`getContenu`, `envoyerDemande`) using `wix-data` and `@wix/web-methods`
- `src/pages/` — Wix page code (minimal, mostly empty `onReady` stubs)
- `wix.config.json` — Wix site ID

## Running the Preview
```bash
docker compose -f docker-compose.base44.yml up -d
```
No external credentials or secrets needed. The site is fully static in preview mode.

## Editing
Changes to `src/public/custom-elements/buropulse-site.js` require a browser refresh (call `reload_preview`). There is no live-reload dev server — `wix dev` needs Wix auth.
