import { HomeAssistant, LovelaceCard } from "../types";

interface DiagnosticsConfig {
  title?: string;
}

type CardHelpers = {
  createCardElement: (config: Record<string, unknown>) => LovelaceCard;
};

class FlightStatusTrackerDiagnosticsCard extends HTMLElement implements LovelaceCard {
  static getStubConfig(): Record<string, unknown> {
    return { type: "custom:flight-status-tracker-diagnostics-card" };
  }

  private _config: DiagnosticsConfig = {};
  private _hass?: HomeAssistant;
  private _card?: LovelaceCard;

  setConfig(config: DiagnosticsConfig): void {
    this._config = config || {};
    void this.buildCard();
  }

  set hass(hass: HomeAssistant | undefined) {
    this._hass = hass;
    if (this._card && hass) this._card.hass = hass;
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  private async buildCard(): Promise<void> {
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
          secondary: "{% set by = state_attr('sensor.flight_status_tracker_api_calls','by_provider') or {} %} FlightAPI {{ by.get('flightapi', 0) }} · AirLabs {{ by.get('airlabs', 0) }} · Aviationstack {{ by.get('aviationstack', 0) }} · FR24 {{ by.get('flightradar24', 0) }}",
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
            { entity: "button.flight_status_tracker_remove_landed_flights", name: "Remove landed flights" },
            { entity: "button.flight_status_tracker_refresh_directory_data", name: "Refresh airport/airline directory data" },
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
