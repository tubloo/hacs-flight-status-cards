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
