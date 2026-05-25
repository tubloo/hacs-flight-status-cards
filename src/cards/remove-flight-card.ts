import { HomeAssistant, LovelaceCard } from "../types";

interface RemoveConfig {
  title?: string;
}

type CardHelpers = {
  createCardElement: (config: Record<string, unknown>) => LovelaceCard;
};

class FlightStatusTrackerRemoveCard extends HTMLElement implements LovelaceCard {
  private _config: RemoveConfig = {};
  private _hass?: HomeAssistant;
  private _card?: LovelaceCard;

  setConfig(config: RemoveConfig): void {
    this._config = config || {};
    this.buildCard();
  }

  set hass(hass: HomeAssistant | undefined) {
    this._hass = hass;
    if (this._card && hass) this._card.hass = hass;
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  private async buildCard(): Promise<void> {
    const windowWithHelpers = window as unknown as {
      loadCardHelpers?: () => Promise<CardHelpers>;
    };
    if (!windowWithHelpers.loadCardHelpers) return;

    const helpers = await windowWithHelpers.loadCardHelpers();
    const config: Record<string, unknown> = {
      type: "entities",
      title: this._config.title || "Remove Flight",
      show_header_toggle: false,
      entities: [
        { entity: "select.flight_status_tracker_remove_flight", name: "Select flight to remove" },
        { entity: "button.flight_status_tracker_remove_selected_flight", name: "Remove selected flight" },
      ],
    };

    this._card = helpers.createCardElement(config);
    if (this._hass) this._card.hass = this._hass;
    this.replaceChildren(this._card);
  }

  getCardSize(): number {
    return 2;
  }
}

if (!customElements.get("flight-status-tracker-remove-card")) {
  customElements.define("flight-status-tracker-remove-card", FlightStatusTrackerRemoveCard);
}
