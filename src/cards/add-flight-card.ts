import { HomeAssistant, LovelaceCard } from "../types";

interface AddConfig {
  title?: string;
}

type CardHelpers = {
  createCardElement: (config: Record<string, unknown>) => LovelaceCard;
};

class FlightStatusTrackerAddCard extends HTMLElement implements LovelaceCard {
  static getConfigElement(): HTMLElement {
    return document.createElement("flight-status-tracker-add-card-editor");
  }

  static getStubConfig(): Record<string, unknown> {
    return {};
  }

  private _config: AddConfig = {};
  private _hass?: HomeAssistant;
  private _card?: LovelaceCard;
  private _buildPromise?: Promise<void>;
  private _lastConfigSignature = "";

  setConfig(config: AddConfig): void {
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
    const title = this._config.title || "Add a flight";

    const config: Record<string, unknown> = {
      type: "vertical-stack",
      cards: [
        {
          type: "custom:mushroom-title-card",
          title,
          subtitle: "Enter airline + number + date, then search and add",
        },
        {
          type: "entities",
          title: "Flight Details",
          show_header_toggle: false,
          entities: [
            { entity: "text.flight_status_tracker_add_flight_airline", name: "Airline code (e.g. EK)" },
            { entity: "text.flight_status_tracker_add_flight_number", name: "Flight number (e.g. 236)" },
            { entity: "date.flight_status_tracker_add_flight_date", name: "Date" },
            { entity: "text.flight_status_tracker_add_flight_dep_airport", name: "Departure airport (optional)" },
          ],
        },
        {
          type: "entities",
          title: "Optional Details",
          show_header_toggle: false,
          entities: [
            { entity: "text.flight_status_tracker_add_flight_travellers", name: "Travellers (optional)" },
            { entity: "text.flight_status_tracker_add_flight_notes", name: "Notes (optional)" },
          ],
        },
        {
          type: "custom:tailwindcss-template-card",
          content: `
{% set p = state_attr('sensor.flight_status_tracker_add_preview','preview') or {} %}
{% set f = p.get('flight') %}
{% set ready = p.get('ready') %}
{% set err = p.get('error') %}
{% set warn = p.get('warning') %}
{% set hint = p.get('hint') %}

{% if not f %}
<div class='rounded-2xl bg-[rgba(255,255,255,0.04)] p-4'>
  <div class='text-sm opacity-80'>No preview yet.</div>
  <div class='text-xs opacity-60 mt-1'>Fill fields and tap Search.</div>
</div>
{% else %}
{% set dep = f.get('dep') or {} %}
{% set arr = f.get('arr') or {} %}
{% set dep_air = dep.get('airport') or {} %}
{% set arr_air = arr.get('airport') or {} %}
{% set dep_code = (dep_air.get('iata') or '—')|upper %}
{% set arr_code = (arr_air.get('iata') or '—')|upper %}
{% set airline = f.get('airline_name') or '' %}
{% set ac = f.get('aircraft_type') or '' %}
{% set logo = f.get('airline_logo_url') or ("https://pics.avs.io/64/64/" ~ (f.get('airline_code','')|upper) ~ ".png") %}
{% set dep_time = dep.get('scheduled_local') or dep.get('scheduled') %}
{% set arr_time = arr.get('scheduled_local') or arr.get('scheduled') %}
{% set dep_hm = dep_time and (dep_time|string).replace(' ','T').split('T')[1][:5] %}
{% set arr_hm = arr_time and (arr_time|string).replace(' ','T').split('T')[1][:5] %}
{% set dep_city = dep_air.get('city') or dep_air.get('name') or dep_code %}
{% set arr_city = arr_air.get('city') or arr_air.get('name') or arr_code %}
{% set dep_tz = dep_air.get('tz_short') or '' %}
{% set arr_tz = arr_air.get('tz_short') or '' %}
{% set dep_ops = [] %}
{% if dep.get('check_in_counters') %}{% set dep_ops = dep_ops + ['Check-in ' ~ dep.get('check_in_counters')] %}{% endif %}
{% if dep.get('boarding_time') %}{% set dep_ops = dep_ops + ['Boarding ' ~ ((dep.get('boarding_time')|string).replace(' ','T').split('T')[1][:5])] %}{% endif %}
{% if dep.get('door_time') %}{% set dep_ops = dep_ops + ['Door ' ~ ((dep.get('door_time')|string).replace(' ','T').split('T')[1][:5])] %}{% endif %}
{% set arr_ops = [] %}
{% if arr.get('baggage_claim') %}{% set arr_ops = arr_ops + ['Baggage ' ~ arr.get('baggage_claim')] %}{% endif %}
{% if arr.get('belt') %}{% set arr_ops = arr_ops + ['Belt ' ~ arr.get('belt')] %}{% endif %}
{% set dep_move = [] %}
{% if dep.get('off_block_time') %}{% set dep_move = dep_move + ['Off-block ' ~ ((dep.get('off_block_time')|string).replace(' ','T').split('T')[1][:5])] %}{% endif %}
{% if dep.get('takeoff_time') %}{% set dep_move = dep_move + ['Takeoff ' ~ ((dep.get('takeoff_time')|string).replace(' ','T').split('T')[1][:5])] %}{% endif %}
{% set arr_move = [] %}
{% if arr.get('landing_time') %}{% set arr_move = arr_move + ['Landing ' ~ ((arr.get('landing_time')|string).replace(' ','T').split('T')[1][:5])] %}{% endif %}
{% if arr.get('on_block_time') %}{% set arr_move = arr_move + ['On-block ' ~ ((arr.get('on_block_time')|string).replace(' ','T').split('T')[1][:5])] %}{% endif %}
{% set input_date = (p.get('input') or {}).get('date') %}
{% set dep_date = dep_time and as_datetime(dep_time) %}
{% set arr_date = arr_time and as_datetime(arr_time) %}
{% set dep_date_input = input_date and as_datetime(input_date ~ 'T00:00:00') %}
{% set dep_date_display = dep_date and dep_date.strftime('%d %b (%a)') or (dep_date_input and dep_date_input.strftime('%d %b (%a)')) or '—' %}
{% set arr_date_display = arr_date and arr_date.strftime('%d %b (%a)') or '—' %}

<div class='rounded-2xl bg-[rgba(255,255,255,0.04)] p-4 space-y-3'>
  <div class='flex items-center gap-3'>
    <img src='{{ logo }}' class='h-10 w-10 object-contain rounded bg-white/90 p-1 ring-1 ring-white/30' />
    <div class='flex-1'>
      <div class='text-lg'>{{ f.get('airline_code','—') }} {{ f.get('flight_number','—') }} · {{ dep_date_display }}</div>
      <div class='text-sm opacity-80'>{{ airline }}{% if ac %} · {{ ac }}{% endif %}</div>
    </div>
    <span class='text-xs px-2 py-1 rounded-full {{ "bg-emerald-800 text-white" if ready else "bg-amber-700 text-white" }}'>
      {{ "Ready" if ready else "Preview" }}
    </span>
  </div>

  <div class='flex items-center gap-2'>
    <div class='text-xl font-semibold'>{{ dep_code }}</div>
    <div class='flex-1 h-0.5 bg-gray-300/60'></div>
    <div class='text-xl font-semibold'>{{ arr_code }}</div>
  </div>

  <div class='grid grid-cols-2 gap-x-4 gap-y-1 text-sm'>
    <div class='opacity-80'>{{ dep_city|title }} · {{ dep_date_display }}</div><div class='opacity-80'>{{ arr_city|title }} · {{ arr_date_display }}</div>
    <div class='text-2xl font-semibold text-gray-700'>{{ dep_hm or '—' }} <span class='text-xs opacity-70'>{{ dep_tz }}</span></div>
    <div class='text-2xl font-semibold text-gray-700'>{{ arr_hm or '—' }} <span class='text-xs opacity-70'>{{ arr_tz }}</span></div>
  </div>

  {% if dep_ops or arr_ops %}
  <div class='grid grid-cols-2 gap-x-4 gap-y-1 text-sm'>
    <div class='opacity-70'>{{ dep_ops|join(' · ') }}</div><div class='opacity-70'>{{ arr_ops|join(' · ') }}</div>
  </div>
  {% endif %}

  {% if dep_move or arr_move %}
  <div class='grid grid-cols-2 gap-x-4 gap-y-1 text-sm'>
    <div class='opacity-70'>{{ dep_move|join(' · ') }}</div><div class='opacity-70'>{{ arr_move|join(' · ') }}</div>
  </div>
  {% endif %}

  {% if err or warn or hint %}
  <div class='text-sm'>
    {% if err %}<div class='text-red-300'>{{ err }}</div>{% endif %}
    {% if warn %}<div class='text-amber-300'>{{ warn }}</div>{% endif %}
    {% if hint and not err and not warn %}<div class='text-gray-300'>{{ hint }}</div>{% endif %}
  </div>
  {% endif %}
</div>
{% endif %}
`,
        },
        {
          type: "horizontal-stack",
          cards: [
            { type: "custom:mushroom-entity-card", entity: "button.flight_status_tracker_preview_from_inputs", name: "Search", icon: "mdi:magnify", tap_action: { action: "call-service", service: "button.press", target: { entity_id: "button.flight_status_tracker_preview_from_inputs" } } },
            { type: "custom:mushroom-entity-card", entity: "button.flight_status_tracker_confirm_add_preview", name: "Add Flight", icon: "mdi:content-save", tap_action: { action: "call-service", service: "button.press", target: { entity_id: "button.flight_status_tracker_confirm_add_preview" } } },
            { type: "custom:mushroom-entity-card", entity: "button.flight_status_tracker_clear_preview", name: "Clear", icon: "mdi:close-circle", tap_action: { action: "call-service", service: "button.press", target: { entity_id: "button.flight_status_tracker_clear_preview" } } },
          ],
        },
      ],
    };

    this._card = helpers.createCardElement(config);
    if (this._hass) this._card.hass = this._hass;
    this.replaceChildren(this._card);
  }

  getCardSize(): number {
    return 6;
  }
}

if (!customElements.get("flight-status-tracker-add-card")) {
  customElements.define("flight-status-tracker-add-card", FlightStatusTrackerAddCard);
}
