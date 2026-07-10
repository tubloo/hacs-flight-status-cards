# Flight Status Tracker Cards (Home Assistant)

Custom Lovelace cards for the [Flight Status Tracker integration](https://github.com/tubloo/hacs-flight-status-tracker).

Primary integration docs:
- README: https://github.com/tubloo/hacs-flight-status-tracker/blob/main/README.md
- Detailed guide: https://github.com/tubloo/hacs-flight-status-tracker/blob/main/docs/guide.md
- Reference Lovelace templates: https://github.com/tubloo/hacs-flight-status-tracker/tree/main/docs/lovelace

## Cards Included

- `Flight List` (`custom:flight-status-tracker-list-card`)
- `Add Flight` (`custom:flight-status-tracker-add-card`)
- `Remove Flight` (`custom:flight-status-tracker-remove-card`)
- `Diagnostics & Control` (`custom:flight-status-tracker-diagnostics-card`)

## Install (HACS)

1. Open HACS -> Frontend.
2. Add custom repository: `https://github.com/tubloo/hacs-flight-status-cards` (Category: `Dashboard`).
3. Install `Flight Status Tracker Cards`.
4. Restart Home Assistant.
5. Add resource (if HACS does not add it automatically):
   - URL: `/hacsfiles/hacs-flight-status-cards/flight-status-tracker-cards.js`
   - Type: `module`


## Required Frontend Dependencies

Install these from **HACS > Frontend** before using the cards:
- `Mushroom` (`custom:mushroom-*`)
- `Auto-Entities` (`custom:auto-entities`)
- `TailwindCSS Template Card` (`custom:tailwindcss-template-card`)

If a dependency is not listed in HACS, add its GitHub repo under **HACS > Frontend > Custom repositories**.

## Quick Lovelace Example

```yaml
type: vertical-stack
cards:
  - type: custom:flight-status-tracker-list-card
    title: Flight List
  - type: custom:flight-status-tracker-add-card
    title: Add Flight
  - type: custom:flight-status-tracker-remove-card
    title: Remove Flight
  - type: custom:flight-status-tracker-diagnostics-card
    title: Diagnostics & Control
```

## Flight List Card Options

`custom:flight-status-tracker-list-card` supports:

- `title` (string)
- `show_background_image` (boolean, default `true`)
- `max_flights` (number, optional): minimum `1` when set; leave empty to show all flights
- `sort_by` (`departure` | `arrival`, default `departure`)
- `ui_refresh_seconds` (number, default `60`): compatibility option; card now relies on backend meaningful updates for stable rendering (timer-driven pushes are disabled).

Example:

```yaml
type: custom:flight-status-tracker-list-card
title: Flight List
show_background_image: true
max_flights: 5
sort_by: departure
ui_refresh_seconds: 60
```

`Updated` in each flight tile reflects backend-provided update timestamps (stable display, no local ticking countdown).

## Build (for development)

```bash
npm install
npm run build
```

The compiled file used by HACS is:
- `flight-status-tracker-cards.js`

## Sync Policy

This repo follows the integration contract:
- https://github.com/tubloo/hacs-flight-status-tracker/blob/main/docs/cards_contract.md


## Release Notes

- `v1.1.12`: Add Flight preview now shows airport-local times as the primary row and Home Assistant-local times as a secondary row, appending the local date in parentheses only when it differs from the airport-local date.
- `v1.1.11`: Add Flight preview now prefers Home Assistant-local `*_viewer_local` timestamps so card times match the integration timezone instead of airport-local preview fields.
- `v1.0.8`: Restored relative "Updated" label format (min/hr/day ago) while keeping non-live rendering to avoid flicker from time-tick rerenders.
- `v1.0.7`: Reduced flicker by removing timer-driven `hass` pushes, targeting only integration flight entities (instead of scanning all sensors), and removing `now()`-driven template recomputation for progress/countdown/relative-age text.
