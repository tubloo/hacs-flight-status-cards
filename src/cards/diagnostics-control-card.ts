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
          subtitle: "API usage, travel activity, active provider, and quick actions",
        },
        {
          type: "glance",
          title: "API Usage",
          show_icon: false,
          show_name: true,
          show_state: true,
          state_color: false,
          columns: 4,
          entities: [
            { entity: "sensor.flight_status_tracker_api_calls_today", name: "Today" },
            { entity: "sensor.flight_status_tracker_api_utility_meter", name: "Month" },
            { entity: "sensor.flight_status_tracker_api_calls_this_year", name: "Year" },
            { entity: "sensor.flight_status_tracker_api_calls", name: "Lifetime" },
          ],
        },
        {
          type: "statistics-graph",
          title: "Daily API Trend (14d)",
          chart_type: "line",
          period: "day",
          days_to_show: 14,
          stat_types: ["sum"],
          entities: ["sensor.flight_status_tracker_api_calls_today"],
        },
        {
          type: "statistics-graph",
          title: "Monthly API Trend (12mo)",
          chart_type: "line",
          period: "month",
          days_to_show: 365,
          stat_types: ["sum"],
          entities: ["sensor.flight_status_tracker_api_utility_meter"],
        },
        {
          type: "glance",
          title: "Flight Counts",
          show_icon: false,
          show_name: true,
          show_state: true,
          state_color: false,
          columns: 4,
          entities: [
            { entity: "sensor.flight_status_tracker_flights_today", name: "Today" },
            { entity: "sensor.flight_status_tracker_flights_this_month", name: "Month" },
            { entity: "sensor.flight_status_tracker_flights_this_year", name: "Year" },
            { entity: "sensor.flight_status_tracker_flights_lifetime", name: "Lifetime" },
          ],
        },
        {
          type: "statistics-graph",
          title: "Daily Flights Trend (14d)",
          chart_type: "line",
          period: "day",
          days_to_show: 14,
          stat_types: ["sum"],
          entities: ["sensor.flight_status_tracker_flights_today"],
        },
        {
          type: "statistics-graph",
          title: "Monthly Flights Trend (12mo)",
          chart_type: "line",
          period: "month",
          days_to_show: 365,
          stat_types: ["sum"],
          entities: ["sensor.flight_status_tracker_flights_this_month"],
        },
        {
          type: "glance",
          title: "Distance Totals",
          show_icon: false,
          show_name: true,
          show_state: true,
          state_color: false,
          columns: 4,
          entities: [
            { entity: "sensor.flight_status_tracker_distance_today", name: "Today" },
            { entity: "sensor.flight_status_tracker_distance_this_month", name: "Month" },
            { entity: "sensor.flight_status_tracker_distance_this_year", name: "Year" },
            { entity: "sensor.flight_status_tracker_distance_lifetime", name: "Lifetime" },
          ],
        },
        {
          type: "statistics-graph",
          title: "Daily Distance Trend (14d)",
          chart_type: "line",
          period: "day",
          days_to_show: 14,
          stat_types: ["sum"],
          entities: ["sensor.flight_status_tracker_distance_today"],
        },
        {
          type: "statistics-graph",
          title: "Monthly Distance Trend (12mo)",
          chart_type: "line",
          period: "month",
          days_to_show: 365,
          stat_types: ["sum"],
          entities: ["sensor.flight_status_tracker_distance_this_month"],
        },
        {
          type: "markdown",
          title: "Active Provider",
          content: "{% set provider = state_attr('sensor.flight_status_tracker_api_calls', 'provider') or 'unknown' %}{% set total = state_attr('sensor.flight_status_tracker_api_calls', 'provider_total') or 0 %}{% set flows = state_attr('sensor.flight_status_tracker_api_calls', 'provider_flows') or {} %}**Provider:** {{ provider | title }}  \n**Total Calls:** {{ total }}  \n**Schedule:** {{ flows.get('schedule', 0) }}  \n**Status:** {{ flows.get('status', 0) }}  \n**Position:** {{ flows.get('position', 0) }}  \n**Directory:** {{ flows.get('directory', 0) }}",
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
