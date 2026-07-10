# AI Agent Guidelines (Repository Root)

This file defines default instructions for AI coding assistants working in this repository.

## Goals
- Make small, focused changes.
- Keep card behavior consistent with Flight Status Tracker entities/services.
- Preserve backward compatibility of card type names.
- Keep HACS packaging valid.

## Source of Truth
- Primary repo: `https://github.com/tubloo/hacs-flight-status-tracker`
- Contract file to follow: `docs/cards_contract.md` (in primary repo)
- Local sync notes: `SYNC_FROM_INTEGRATION.md`

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
- `flight-status-tracker-list-card` renders from per-flight entity attributes, especially `attributes.flight` and `attributes.ui`; keep template expectations aligned with the integration schema.
- The list card currently expects refresh-facing UI fields such as `updated_ago_min`, `next_update_in_min`, `next_update_abs`, `status_error_text`, and `source` inside `ui`.
- The diagnostics card expects API period sensors to expose totals plus flow-breakdown attributes (`by_flow`, `provider_flows`, `flow_*`, `provider_flow_*`) so the API trend charts can render stacked series by flow.
- The Add Flight card should render airport-local preview times as the primary row and Home Assistant-local `dep/arr.*_viewer_local` times as a secondary row; append the secondary date in parentheses only when the Home Assistant-local date differs from the airport-local date.
- `Next update` belongs on its own line below `Updated`. For terminal flights such as Arrived/Cancelled, the card should render `No further updates` rather than implying another poll is scheduled.
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
- Before release, check primary repo contract (`docs/cards_contract.md`) for any sync-required changes.
- Ensure `hacs.json`, `README.md`, and `flight-status-tracker-cards.js` are up to date.
- Any logic change that affects rendered fields, list-card status text, preview/add UX, or assumptions about integration-provided `ui` attributes must trigger an `AGENTS.md` review and update in the same change when needed.

## Commits
- Include only relevant source + metadata + built artifact.
- Exclude `node_modules/` and temporary files.
- If card behavior, template assumptions, or integration-contract expectations changed, update `AGENTS.md` in the same commit rather than leaving the instruction drift for later.
