import { HomeAssistant, LovelaceCard } from "../types";

interface RemoveConfig {
  title?: string;
  select_entity?: string;
  remove_button_entity?: string;
}

const DEFAULT_SELECT = "select.flight_status_tracker_remove_flight";
const DEFAULT_REMOVE_BUTTON = "button.flight_status_tracker_remove_selected_flight";

class FlightStatusTrackerRemoveCard extends HTMLElement implements LovelaceCard {
  private _config: RemoveConfig = {};

  setConfig(config: RemoveConfig): void {
    this._config = config || {};
  }

  set hass(hass: HomeAssistant | undefined) {
    (this as unknown as { _hass?: HomeAssistant })._hass = hass;
    if (hass) this.render();
  }

  get hass(): HomeAssistant | undefined {
    return (this as unknown as { _hass?: HomeAssistant })._hass;
  }

  private async setSelected(option: string): Promise<void> {
    const selectEntity = this._config.select_entity || DEFAULT_SELECT;
    await this.hass?.callService("select", "select_option", {
      entity_id: selectEntity,
      option,
    });
  }

  private async removeSelected(): Promise<void> {
    const removeButton = this._config.remove_button_entity || DEFAULT_REMOVE_BUTTON;
    await this.hass?.callService("button", "press", { entity_id: removeButton });
  }

  private render(): void {
    if (!this.hass) return;

    const title = this._config.title || "Remove Flight";
    const selectEntity = this._config.select_entity || DEFAULT_SELECT;
    const selectState = this.hass.states[selectEntity];
    const options = Array.isArray(selectState?.attributes?.options)
      ? (selectState.attributes.options as string[])
      : [];
    const current = typeof selectState?.state === "string" ? selectState.state : "";

    const optionHtml = options
      .map((value) => {
        const selected = value === current ? "selected" : "";
        return `<option value="${value}" ${selected}>${value}</option>`;
      })
      .join("");

    this.innerHTML = `
      <ha-card>
        <div class="card-content">
          <h3>${title}</h3>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
            <select id="flight-select" style="min-width:220px;">
              ${optionHtml || '<option value="">No flight available</option>'}
            </select>
            <button id="remove" ${options.length ? "" : "disabled"}>Remove Selected</button>
          </div>
        </div>
      </ha-card>
    `;

    this.querySelector("#flight-select")?.addEventListener("change", async (event) => {
      const target = event.target as HTMLSelectElement;
      if (target?.value) await this.setSelected(target.value);
    });

    this.querySelector("#remove")?.addEventListener("click", async () => {
      await this.removeSelected();
    });
  }

  getCardSize(): number {
    return 2;
  }
}

customElements.define("flight-status-tracker-remove-card", FlightStatusTrackerRemoveCard);
