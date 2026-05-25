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
