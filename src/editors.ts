import { HomeAssistant } from "./types";

type CardConfig = Record<string, unknown>;

class BaseFlightStatusEditor extends HTMLElement {
  protected _config: CardConfig = {};
  protected _hass?: HomeAssistant;
  protected _titleLabel = "Title";
  protected _defaultTitle = "";

  setConfig(config: CardConfig): void {
    this._config = config || {};
    this.render();
  }

  set hass(hass: HomeAssistant | undefined) {
    this._hass = hass;
  }

  protected updateConfig(patch: CardConfig): void {
    this._config = { ...this._config, ...patch };
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected render(): void {
    const title = String(this._config.title || this._defaultTitle || "");
    this.innerHTML = `
      <div style="padding: 12px;">
        <label style="display:block;font-weight:600;margin-bottom:6px;">${this._titleLabel}</label>
        <input id="title" type="text" value="${title.replace(/"/g, "&quot;")}" style="width:100%;padding:8px;box-sizing:border-box;" />
      </div>
    `;

    this.querySelector("#title")?.addEventListener("input", (event) => {
      const value = (event.target as HTMLInputElement).value;
      this.updateConfig({ title: value });
    });
  }
}

class FlightStatusTrackerListCardEditor extends BaseFlightStatusEditor {
  protected _defaultTitle = "Flight List";

  protected render(): void {
    const title = String(this._config.title || this._defaultTitle || "");
    const showBackgroundImage = this._config.show_background_image !== false;
    const sortBy = this._config.sort_by === "arrival" ? "arrival" : "departure";
    const maxFlightsRaw = Number(this._config.max_flights);
    const maxFlights = Number.isFinite(maxFlightsRaw) && maxFlightsRaw > 0 ? Math.floor(maxFlightsRaw) : "";
    this.innerHTML = `
      <div style="padding: 12px;">
        <label style="display:block;font-weight:600;margin-bottom:6px;">${this._titleLabel}</label>
        <input id="title" type="text" value="${title.replace(/"/g, "&quot;")}" style="width:100%;padding:8px;box-sizing:border-box;" />
        <label style="display:block;font-weight:500;margin-top:10px;margin-bottom:6px;">Maximum flights to display</label>
        <input id="max_flights" type="number" min="1" step="1" value="${maxFlights}" placeholder="All" style="width:100%;padding:8px;box-sizing:border-box;" />
        <div style="font-size:12px;opacity:0.7;margin-top:4px;">Leave empty for all flights.</div>
        <label style="display:block;font-weight:500;margin-top:10px;margin-bottom:6px;">Sort by</label>
        <select id="sort_by" style="width:100%;padding:8px;box-sizing:border-box;">
          <option value="departure" ${sortBy === "departure" ? "selected" : ""}>Departure</option>
          <option value="arrival" ${sortBy === "arrival" ? "selected" : ""}>Arrival</option>
        </select>
        <label style="display:flex;align-items:center;gap:8px;margin-top:10px;font-weight:500;">
          <input id="show_background_image" type="checkbox" ${showBackgroundImage ? "checked" : ""} />
          Show aircraft background image
        </label>
      </div>
    `;

    this.querySelector("#title")?.addEventListener("input", (event) => {
      const value = (event.target as HTMLInputElement).value;
      this.updateConfig({ title: value });
    });
    this.querySelector("#max_flights")?.addEventListener("input", (event) => {
      const raw = (event.target as HTMLInputElement).value.trim();
      if (!raw) {
        this.updateConfig({ max_flights: undefined });
        return;
      }
      const parsed = Math.max(1, Math.floor(Number(raw)));
      this.updateConfig({ max_flights: Number.isFinite(parsed) ? parsed : undefined });
    });
    this.querySelector("#sort_by")?.addEventListener("change", (event) => {
      const value = (event.target as HTMLSelectElement).value === "arrival" ? "arrival" : "departure";
      this.updateConfig({ sort_by: value });
    });
    this.querySelector("#show_background_image")?.addEventListener("change", (event) => {
      const checked = (event.target as HTMLInputElement).checked;
      this.updateConfig({ show_background_image: checked });
    });
  }
}

class FlightStatusTrackerAddCardEditor extends BaseFlightStatusEditor {
  protected _defaultTitle = "Add a flight";
}

class FlightStatusTrackerRemoveCardEditor extends BaseFlightStatusEditor {
  protected _defaultTitle = "Remove Flight";
}

class FlightStatusTrackerDiagnosticsCardEditor extends BaseFlightStatusEditor {
  protected _defaultTitle = "Diagnostics";
}

if (!customElements.get("flight-status-tracker-list-card-editor")) {
  customElements.define("flight-status-tracker-list-card-editor", FlightStatusTrackerListCardEditor);
}
if (!customElements.get("flight-status-tracker-add-card-editor")) {
  customElements.define("flight-status-tracker-add-card-editor", FlightStatusTrackerAddCardEditor);
}
if (!customElements.get("flight-status-tracker-remove-card-editor")) {
  customElements.define("flight-status-tracker-remove-card-editor", FlightStatusTrackerRemoveCardEditor);
}
if (!customElements.get("flight-status-tracker-diagnostics-card-editor")) {
  customElements.define("flight-status-tracker-diagnostics-card-editor", FlightStatusTrackerDiagnosticsCardEditor);
}
