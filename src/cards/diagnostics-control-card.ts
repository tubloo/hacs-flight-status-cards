import { HomeAssistant, LovelaceCard } from "../types";

interface DiagnosticsConfig {
  title?: string;
  api_graph_style?: "bar" | "line" | "area";
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
    const apiGraphStyle =
      this._config.api_graph_style === "line" || this._config.api_graph_style === "area"
        ? this._config.api_graph_style
        : "bar";
    const apiSeriesType = apiGraphStyle === "bar" ? "column" : apiGraphStyle;

    const config: Record<string, unknown> = {
      type: "vertical-stack",
      cards: [
        {
          type: "custom:mushroom-title-card",
          title,
          subtitle: "API usage, travel activity, active provider, and quick actions",
        },
        {
          type: "markdown",
          title: "Key Metrics",
          content:
            "| Metric | Today | Month | Year | Lifetime |\n" +
            "| --- | ---: | ---: | ---: | ---: |\n" +
            "| API | {{ states('sensor.flight_status_tracker_api_calls_today') }} | {{ states('sensor.flight_status_tracker_api_utility_meter') }} | {{ states('sensor.flight_status_tracker_api_calls_this_year') }} | {{ states('sensor.flight_status_tracker_api_calls') }} |\n" +
            "| Flights | {{ states('sensor.flight_status_tracker_flights_today') }} | {{ states('sensor.flight_status_tracker_flights_this_month') }} | {{ states('sensor.flight_status_tracker_flights_this_year') }} | {{ states('sensor.flight_status_tracker_flights_lifetime') }} |\n" +
            "| Distance | {{ states('sensor.flight_status_tracker_distance_today') }} | {{ states('sensor.flight_status_tracker_distance_this_month') }} | {{ states('sensor.flight_status_tracker_distance_this_year') }} | {{ states('sensor.flight_status_tracker_distance_lifetime') }} |",
        },
        {
          type: "custom:apexcharts-card",
          graph_span: "30d",
          span: { end: "day" },
          header: {
            show: true,
            title: "API Trend (30d)",
            show_states: false,
          },
          series: [
            {
              entity: "sensor.flight_status_tracker_api_calls_today",
              name: "API Calls",
              type: apiSeriesType,
              group_by: { func: "max", duration: "1d" },
              stroke_width: apiGraphStyle === "bar" ? 0 : 3,
            },
          ],
        },
        {
          type: "custom:apexcharts-card",
          graph_span: "365d",
          span: { end: "month" },
          header: {
            show: true,
            title: "API Trend (12mo)",
            show_states: false,
          },
          series: [
            {
              entity: "sensor.flight_status_tracker_api_utility_meter",
              name: "API Calls",
              type: apiSeriesType,
              group_by: { func: "max", duration: "1mo" },
              stroke_width: apiGraphStyle === "bar" ? 0 : 3,
            },
          ],
        },
        {
          type: "custom:apexcharts-card",
          graph_span: "365d",
          span: { end: "month" },
          header: {
            show: true,
            title: "Flights + Distance (12mo)",
            show_states: false,
          },
          yaxis: [
            {
              id: "flights",
              decimals: 0,
              min: 0,
              apex_config: { title: { text: "Flights" }, tickAmount: 4 },
            },
            {
              id: "distance",
              opposite: true,
              decimals: 0,
              min: 0,
              apex_config: { title: { text: "Distance" }, tickAmount: 4 },
            },
          ],
          series: [
            {
              entity: "sensor.flight_status_tracker_flights_this_month",
              name: "Flights",
              type: "column",
              yaxis_id: "flights",
              statistics: { type: "sum", period: "month", align: "end" },
            },
            {
              entity: "sensor.flight_status_tracker_distance_this_month",
              name: "Distance",
              type: "line",
              yaxis_id: "distance",
              statistics: { type: "sum", period: "month", align: "end" },
              stroke_width: 3,
            },
          ],
        },
        {
          type: "markdown",
          title: "Provider Summary",
          content:
            "{% set providers = state_attr('sensor.flight_status_tracker_api_calls', 'providers') or {} %}" +
            "| Provider | Preview | Status | Position | Directory | Total |\n" +
            "| --- | ---: | ---: | ---: | ---: | ---: |\n" +
            "{% for provider, stats in providers.items() %}" +
            "| {{ provider | title }} | {{ stats.get('schedule', 0) }} | {{ stats.get('status', 0) }} | {{ stats.get('position', 0) }} | {{ stats.get('directory', 0) }} | {{ stats.get('total', 0) }} |\n" +
            "{% endfor %}",
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
