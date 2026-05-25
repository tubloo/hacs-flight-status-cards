import { DEFAULT_SUMMARY_ENTITY, findFlightEntities, readFlight, formatWhen } from "../helpers";
import { HomeAssistant, LovelaceCard } from "../types";

interface ListConfig {
  title?: string;
  summary_entity?: string;
}

class FlightStatusTrackerListCard extends HTMLElement implements LovelaceCard {
  private _config: ListConfig = {};

  setConfig(config: ListConfig): void {
    this._config = config || {};
  }

  set hassState(hass: HomeAssistant) {
    this.hass = hass;
    this.render();
  }

  set hass(hass: HomeAssistant | undefined) {
    (this as unknown as { _hass?: HomeAssistant })._hass = hass;
    if (hass) this.render();
  }

  get hass(): HomeAssistant | undefined {
    return (this as unknown as { _hass?: HomeAssistant })._hass;
  }

  private render(): void {
    if (!this.hass) return;
    const title = this._config.title || "Flights";
    const summaryEntity = this._config.summary_entity || DEFAULT_SUMMARY_ENTITY;
    const summary = this.hass.states[summaryEntity];
    const count = Number(summary?.attributes?.flights_total ?? 0);

    const rows = findFlightEntities(this.hass)
      .map((entity) => ({ entity, flight: readFlight(entity) }))
      .filter((x) => x.flight)
      .sort((a, b) => {
        const ad = new Date(a.flight?.dep?.scheduled_utc || 0).getTime();
        const bd = new Date(b.flight?.dep?.scheduled_utc || 0).getTime();
        return ad - bd;
      })
      .map(({ entity, flight }) => {
        const f = flight!;
        const route = `${f.dep?.airport_iata || "?"} -> ${f.arr?.airport_iata || "?"}`;
        const code = `${f.airline || ""} ${f.flight_number || ""}`.trim();
        return `
          <tr>
            <td>${code || entity.entity_id}</td>
            <td>${route}</td>
            <td>${f.status || "Unknown"}</td>
            <td>${formatWhen(f.dep?.scheduled_utc)}</td>
          </tr>
        `;
      })
      .join("");

    this.innerHTML = `
      <ha-card>
        <div class="card-content">
          <h3>${title}</h3>
          <div>Total: ${count}</div>
          <table>
            <thead><tr><th>Flight</th><th>Route</th><th>Status</th><th>Departure</th></tr></thead>
            <tbody>${rows || '<tr><td colspan="4">No flights</td></tr>'}</tbody>
          </table>
        </div>
      </ha-card>
    `;
  }

  getCardSize(): number {
    return 4;
  }
}

customElements.define("flight-status-tracker-list-card", FlightStatusTrackerListCard);
