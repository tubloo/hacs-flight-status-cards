import { HomeAssistant, LovelaceCard } from "../types";

interface DiagnosticsConfig {
  title?: string;
  summary_entity?: string;
  api_calls_entity?: string;
  api_monthly_entity?: string;
  refresh_button_entity?: string;
  remove_landed_button_entity?: string;
  refresh_directory_button_entity?: string;
}

const DEFAULTS = {
  summary_entity: "sensor.flight_status_tracker_upcoming_flights",
  api_calls_entity: "sensor.flight_status_tracker_api_calls",
  api_monthly_entity: "sensor.flight_status_tracker_api_utility_meter",
  refresh_button_entity: "button.flight_status_tracker_refresh_now",
  remove_landed_button_entity: "button.flight_status_tracker_remove_landed",
  refresh_directory_button_entity: "button.flight_status_tracker_refresh_directory_data",
};

class FlightStatusTrackerDiagnosticsCard extends HTMLElement implements LovelaceCard {
  private _config: DiagnosticsConfig = {};

  setConfig(config: DiagnosticsConfig): void {
    this._config = config || {};
  }

  set hass(hass: HomeAssistant | undefined) {
    (this as unknown as { _hass?: HomeAssistant })._hass = hass;
    if (hass) this.render();
  }

  get hass(): HomeAssistant | undefined {
    return (this as unknown as { _hass?: HomeAssistant })._hass;
  }

  private async press(entityId: string): Promise<void> {
    await this.hass?.callService("button", "press", { entity_id: entityId });
  }

  private get entityIds() {
    return { ...DEFAULTS, ...this._config };
  }

  private render(): void {
    if (!this.hass) return;
    const ids = this.entityIds;
    const title = this._config.title || "Diagnostics & Control";

    const summary = this.hass.states[ids.summary_entity];
    const apiCalls = this.hass.states[ids.api_calls_entity];
    const monthly = this.hass.states[ids.api_monthly_entity];

    const flightsTotal = String(summary?.attributes?.flights_total ?? summary?.state ?? "-");
    const lifetimeCalls = apiCalls?.state ?? "-";
    const monthlyCalls = monthly?.state ?? "-";

    const byProvider = (apiCalls?.attributes?.by_provider || {}) as Record<string, unknown>;
    const providerText = [
      `FlightAPI ${String(byProvider.flightapi ?? 0)}`,
      `AirLabs ${String(byProvider.airlabs ?? 0)}`,
      `Aviationstack ${String(byProvider.aviationstack ?? 0)}`,
      `FR24 ${String(byProvider.flightradar24 ?? 0)}`,
    ].join(" | ");

    this.innerHTML = `
      <ha-card>
        <div class="card-content">
          <h3>${title}</h3>
          <div style="display:grid;grid-template-columns:repeat(2,minmax(120px,1fr));gap:8px;margin-bottom:10px;">
            <div><strong>Upcoming Flights</strong><br>${flightsTotal}</div>
            <div><strong>Monthly API Calls</strong><br>${monthlyCalls}</div>
            <div><strong>Lifetime API Calls</strong><br>${lifetimeCalls}</div>
            <div><strong>Provider Mix</strong><br>${providerText}</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button id="refresh">Refresh Now</button>
            <button id="remove-landed">Remove Landed</button>
            <button id="refresh-directory">Refresh Directory</button>
          </div>
        </div>
      </ha-card>
    `;

    this.querySelector("#refresh")?.addEventListener("click", () => this.press(ids.refresh_button_entity));
    this.querySelector("#remove-landed")?.addEventListener("click", () => this.press(ids.remove_landed_button_entity));
    this.querySelector("#refresh-directory")?.addEventListener("click", () => this.press(ids.refresh_directory_button_entity));
  }

  getCardSize(): number {
    return 3;
  }
}

customElements.define("flight-status-tracker-diagnostics-card", FlightStatusTrackerDiagnosticsCard);
