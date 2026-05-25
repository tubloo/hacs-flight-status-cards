# AI Agent Guidelines (Repository Root)

This file defines default instructions for AI coding assistants working in this repository.

## Goals
- Make small, focused changes.
- Keep card behavior consistent with Flight Status Tracker entities/services.
- Preserve backward compatibility of card type names.
- Keep HACS packaging valid.

## Repository Map
- `src/cards/`: custom card implementations.
- `src/index.ts`: card registration (`window.customCards`).
- `flight-status-tracker-cards.js`: compiled artifact shipped via HACS.
- `hacs.json`: HACS metadata.

## Architectural Notes
- Card type IDs are public API and must remain stable:
  - `flight-status-tracker-list-card`
  - `flight-status-tracker-add-card`
  - `flight-status-tracker-remove-card`
  - `flight-status-tracker-diagnostics-card`
- Default entity IDs should match the integration defaults when possible.
- Prefer configurable entity IDs in card config for flexibility.

## Development Workflow
- Install/build:
  - `npm install`
  - `npm run build`
- TypeScript output goes to `build/` and bundled output to `flight-status-tracker-cards.js`.

## Home Assistant Frontend Conventions
- Avoid heavy dependencies and keep bundle size small.
- Avoid introducing unsafe HTML handling.
- Keep render logic resilient when entities are missing/unavailable.

## Code Style
- Match existing TypeScript style.
- Keep logic simple and readable.
- Add type hints/interfaces where useful.

## Testing / Validation
When behavior changes, validate at least:
- `npm run build` succeeds.
- Cards appear in Lovelace card picker.
- Buttons call expected HA services.

## Releases
- Do not create releases automatically.
- Ask for confirmation before tagging/publishing.
- Ensure `hacs.json`, `README.md`, and `flight-status-tracker-cards.js` are up to date.

## Commits
- Include only relevant source + metadata + built artifact.
- Exclude `node_modules/` and temporary files.
