import { HomeAssistant, LovelaceCard } from "../types";

interface AddConfig {
  title?: string;
}

class FlightStatusTrackerAddCard extends HTMLElement implements LovelaceCard {
  private _config: AddConfig = {};

  setConfig(config: AddConfig): void {
    this._config = config || {};
  }

  set hass(hass: HomeAssistant | undefined) {
    (this as unknown as { _hass?: HomeAssistant })._hass = hass;
    if (hass) this.render();
  }

  get hass(): HomeAssistant | undefined {
    return (this as unknown as { _hass?: HomeAssistant })._hass;
  }

  private async callButton(entityId: string): Promise<void> {
    if (!this.hass) return;
    await this.hass.callService("button", "press", { entity_id: entityId });
  }

  private render(): void {
    const title = this._config.title || "Add Flight";
    this.innerHTML = `
      <ha-card>
        <div class="card-content">
          <h3>${title}</h3>
          <p>Fill your helper entities in the dashboard, then use actions below.</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button id="preview">Preview</button>
            <button id="confirm">Add Flight</button>
            <button id="clear">Clear</button>
          </div>
        </div>
      </ha-card>
    `;

    this.querySelector("#preview")?.addEventListener("click", () => this.callButton("button.flight_status_tracker_preview_from_inputs"));
    this.querySelector("#confirm")?.addEventListener("click", () => this.callButton("button.flight_status_tracker_confirm_add_preview"));
    this.querySelector("#clear")?.addEventListener("click", () => this.callButton("button.flight_status_tracker_clear_preview"));
  }

  getCardSize(): number {
    return 2;
  }
}

customElements.define("flight-status-tracker-add-card", FlightStatusTrackerAddCard);
