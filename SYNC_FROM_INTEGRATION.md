# Sync With Primary Integration Repo

Primary source-of-truth repo:
- `https://github.com/tubloo/hacs-flight-status-tracker`

Contract to follow:
- `docs/cards_contract.md` in the primary repo.

## Rule
If the integration changes entities/services/attributes/workflow used by cards, update this cards repo before or alongside integration release.

## Minimum Sync Checklist
1. Review primary repo `docs/cards_contract.md`.
2. Verify card defaults and UI actions still match integration behavior.
3. Build and verify:
   - `npm run build`
   - Cards appear and function in Home Assistant.
4. Release/update this repo when needed.

## Card Types That Must Stay Stable
- `flight-status-tracker-list-card`
- `flight-status-tracker-add-card`
- `flight-status-tracker-remove-card`
- `flight-status-tracker-diagnostics-card`
