import { HomeAssistant, LovelaceCard } from "../types";

interface DiagnosticsConfig {
  title?: string;
}

type CardHelpers = {
  createCardElement: (config: Record<string, unknown>) => LovelaceCard;
};

class FlightStatusTrackerDiagnosticsCard extends HTMLElement implements LovelaceCard {
  static getConfigElement(): HTMLElement {
    return document.createElement("flight-status-tracker-diagnostics-card-editor");
  }

  static getStubConfig(): Record<string, unknown> {
    return {};
  }

  private _config: DiagnosticsConfig = {};
  private _hass?: HomeAssistant;
  private _card?: LovelaceCard;
  private _buildPromise?: Promise<void>;
  private _lastConfigSignature = "";

  setConfig(config: DiagnosticsConfig): void {
    this._config = config || {};
    const nextSignature = JSON.stringify(this._config || {});
    if (this._card && nextSignature === this._lastConfigSignature) return;
    this._lastConfigSignature = nextSignature;
    this._buildPromise = this.buildCard();
  }

  set hass(hass: HomeAssistant | undefined) {
    this._hass = hass;
    if (this._card && hass) this._card.hass = hass;
    else if (hass && !this._buildPromise) this._buildPromise = this.buildCard();
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  private async buildCard(): Promise<void> {
    if (this._card) return;
    const windowWithHelpers = window as unknown as { loadCardHelpers?: () => Promise<CardHelpers> };
    if (!windowWithHelpers.loadCardHelpers) return;

    const helpers = await windowWithHelpers.loadCardHelpers();
    const title = this._config.title || "Diagnostics";

    const config: Record<string, unknown> = {
      type: "vertical-stack",
      cards: [
        {
          type: "custom:mushroom-title-card",
          title,
          subtitle: "API usage, provider mix, and quick actions",
        },
        {
          type: "grid",
          columns: 2,
          square: false,
          cards: [
            { type: "custom:mushroom-entity-card", entity: "sensor.flight_status_tracker_api_utility_meter", name: "Monthly API Calls", icon: "mdi:calendar-month", icon_color: "blue" },
            {
              type: "custom:mushroom-template-card",
              primary: "Lifetime API Calls",
              secondary: "{{ states('sensor.flight_status_tracker_api_calls') }} calls",
              icon: "mdi:api",
              icon_color: "teal",
              tap_action: { action: "more-info", entity: "sensor.flight_status_tracker_api_calls" },
            },
          ],
        },
        {
          type: "statistics-graph",
          title: "Monthly API Trend (30d)",
          chart_type: "line",
          period: "day",
          days_to_show: 30,
          stat_types: ["sum"],
          entities: ["sensor.flight_status_tracker_api_utility_meter"],
        },
        {
          type: "custom:mushroom-template-card",
          primary: "Provider Breakdown (Lifetime)",
          secondary: "{% set by = state_attr('sensor.flight_status_tracker_api_calls','by_provider') or {} %} AeroDataBox {{ by.get('aerodatabox', 0) }} · FlightAPI {{ by.get('flightapi', 0) }}",
          icon: "mdi:chart-donut",
          icon_color: "indigo",
          tap_action: { action: "more-info", entity: "sensor.flight_status_tracker_api_calls" },
        },
        {
          type: "entities",
          title: "Controls",
          show_header_toggle: false,
          entities: [
            { entity: "sensor.flight_status_tracker_upcoming_flights", name: "Upcoming flights (summary)" },
            { entity: "button.flight_status_tracker_refresh_now", name: "Refresh now" },
            { entity: "button.flight_status_tracker_remove_landed", name: "Remove landed flights" },
            { entity: "button.flight_status_tracker_refresh_directory", name: "Refresh airport/airline directory data" },
          ],
        },
      ],
    };

    this._card = helpers.createCardElement(config);
    if (this._hass) this._card.hass = this._hass;
    this.replaceChildren(this._card);
  }

  getCardSize(): number {
    return 5;
  }
}

if (!customElements.get("flight-status-tracker-diagnostics-card")) {
  customElements.define("flight-status-tracker-diagnostics-card", FlightStatusTrackerDiagnosticsCard);
}
