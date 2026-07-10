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
<div class='rounded-2xl bg-[rgba(255,255,255,0.04)] p-4 space-y-3'>
  <div>
    <div class='text-sm opacity-80'>No preview yet.</div>
    <div class='text-xs opacity-60 mt-1'>Fill fields and tap Search.</div>
  </div>
  {% if err or warn or hint %}
  <div class='space-y-2 text-sm'>
    {% if err %}<div class='rounded-xl bg-red-900/70 px-3 py-2 font-medium text-red-100 ring-1 ring-red-400/40'>{{ err }}</div>{% endif %}
    {% if warn %}<div class='rounded-xl bg-amber-900/60 px-3 py-2 text-amber-100 ring-1 ring-amber-400/40'>{{ warn }}</div>{% endif %}
    {% if hint and not err and not warn %}<div class='rounded-xl bg-slate-800/60 px-3 py-2 text-slate-100 ring-1 ring-slate-400/30'>{{ hint }}</div>{% endif %}
  </div>
  {% endif %}
</div>
{% else %}
{% set dep = f.get('dep') or {} %}
{% set arr = f.get('arr') or {} %}
{% set dep_air = dep.get('airport') or {} %}
{% set arr_air = arr.get('airport') or {} %}
{% set dep_code = (dep_air.get('iata') or '—')|upper %}
{% set arr_code = (arr_air.get('iata') or '—')|upper %}
{% set route_arr_code = arr_code %}
{% set airline = f.get('airline_name') or '' %}
{% set ac = f.get('aircraft_type') or '' %}
{% set logo = f.get('airline_logo_url') or ("https://pics.avs.io/64/64/" ~ (f.get('airline_code','')|upper) ~ ".png") %}
{% set aircraft_image = f.get('aircraft_image_url') %}
{% set raw_state = f.get('status_state') or 'Unknown' %}
{% set route_state = 'Scheduled' if raw_state|lower == 'unknown' else raw_state %}
{% set state = route_state %}

{% set dep_primary_src = dep.get('actual_local') or dep.get('estimated_local') or dep.get('scheduled_local') or dep.get('actual') or dep.get('estimated') or dep.get('scheduled') %}
{% set arr_primary_src = arr.get('actual_local') or arr.get('estimated_local') or arr.get('scheduled_local') or arr.get('actual') or arr.get('estimated') or arr.get('scheduled') %}
{% set dep_sched_src = dep.get('scheduled_local') or dep.get('scheduled') %}
{% set arr_sched_src = arr.get('scheduled_local') or arr.get('scheduled') %}
{% set dep_primary = dep_primary_src and (dep_primary_src|string).replace(' ','T').split('T')[1][:5] or '—' %}
{% set arr_primary = arr_primary_src and (arr_primary_src|string).replace(' ','T').split('T')[1][:5] or '—' %}
{% set dep_strike = dep_sched_src and (dep_sched_src|string).replace(' ','T').split('T')[1][:5] or none %}
{% set arr_strike = arr_sched_src and (arr_sched_src|string).replace(' ','T').split('T')[1][:5] or none %}
{% set dep_changed = dep_primary != '—' and dep_strike and dep_primary != dep_strike %}
{% set arr_changed = arr_primary != '—' and arr_strike and arr_primary != arr_strike %}
{% set show_strike_row = dep_changed or arr_changed %}

{% set dep_viewer_src = dep.get('actual_viewer_local') or dep.get('estimated_viewer_local') or dep.get('scheduled_viewer_local') %}
{% set arr_viewer_src = arr.get('actual_viewer_local') or arr.get('estimated_viewer_local') or arr.get('scheduled_viewer_local') %}
{% set viewer_tz = now().strftime('%Z') or (dep_viewer_src and as_datetime(dep_viewer_src).strftime('%Z')) or '' %}
{% set dep_viewer = dep_viewer_src and (dep_viewer_src|string).replace(' ','T').split('T')[1][:5] or none %}
{% set arr_viewer = arr_viewer_src and (arr_viewer_src|string).replace(' ','T').split('T')[1][:5] or none %}
{% set dep_local_date = dep_primary_src and as_datetime(dep_primary_src).strftime('%d %b') or none %}
{% set arr_local_date = arr_primary_src and as_datetime(arr_primary_src).strftime('%d %b') or none %}
{% set dep_viewer_date = dep_viewer_src and as_datetime(dep_viewer_src).strftime('%d %b') or none %}
{% set arr_viewer_date = arr_viewer_src and as_datetime(arr_viewer_src).strftime('%d %b') or none %}
{% set dep_viewer_suffix = ' (' ~ dep_viewer_date ~ ')' if dep_viewer and dep_local_date and dep_viewer_date and dep_viewer_date != dep_local_date else '' %}
{% set arr_viewer_suffix = ' (' ~ arr_viewer_date ~ ')' if arr_viewer and arr_local_date and arr_viewer_date and arr_viewer_date != arr_local_date else '' %}
{% set show_viewer_row = dep_viewer or arr_viewer %}

{% set dep_tz = dep_air.get('tz_short') or (dep_primary_src and as_datetime(dep_primary_src).strftime('%Z')) or '' %}
{% set arr_tz = arr_air.get('tz_short') or (arr_primary_src and as_datetime(arr_primary_src).strftime('%Z')) or '' %}
{% set dep_city = dep_air.get('city') or dep_air.get('name') or dep_code %}
{% set arr_city = arr_air.get('city') or arr_air.get('name') or arr_code %}
{% set dep_date_display = dep_primary_src and as_datetime(dep_primary_src).strftime('%d %b (%a)') or '—' %}
{% set arr_date_display = arr_primary_src and as_datetime(arr_primary_src).strftime('%d %b (%a)') or '—' %}

{% set dep_live_dt = dep.get('actual') or dep.get('estimated') %}
{% set arr_live_dt = arr.get('actual') or arr.get('estimated') %}
{% set delay_minutes = none %}
{% if arr.get('scheduled') and arr_live_dt %}
  {% set delay_minutes = (((as_timestamp(as_datetime(arr_live_dt)) - as_timestamp(as_datetime(arr.get('scheduled')))) / 60) | round(0)) | int %}
{% elif dep.get('scheduled') and dep_live_dt %}
  {% set delay_minutes = (((as_timestamp(as_datetime(dep_live_dt)) - as_timestamp(as_datetime(dep.get('scheduled')))) / 60) | round(0)) | int %}
{% endif %}
{% set is_delayed = delay_minutes is number and delay_minutes > 10 %}
{% set badge = 'bg-gray-600 text-white' %}
{% set route_color = 'text-gray-400' %}
{% set time_color = 'text-gray-300' %}
{% if route_state in ['Cancelled', 'Canceled', 'Diverted'] or is_delayed %}
  {% set badge = 'bg-red-800 text-white' %}
  {% set route_color = 'text-red-700' %}
  {% set time_color = 'text-red-600' %}
{% elif route_state in ['Scheduled', 'En Route', 'Arrived', 'Landed'] %}
  {% set badge = 'bg-emerald-800 text-white' %}
  {% set route_color = 'text-emerald-700' %}
  {% set time_color = 'text-emerald-600' %}
{% endif %}
{% set route_bg = route_color | replace('text-','bg-') %}

{% set dep_term_gate = ([('Terminal ' ~ dep.get('terminal')) if dep.get('terminal') else '', ('Gate ' ~ dep.get('gate')) if dep.get('gate') else ''] | reject('equalto', '') | list | join(' · ')) %}
{% set arr_term_gate = ([('Terminal ' ~ arr.get('terminal')) if arr.get('terminal') else '', ('Gate ' ~ arr.get('gate')) if arr.get('gate') else ''] | reject('equalto', '') | list | join(' · ')) %}
{% set show_term_gate_row = dep_term_gate or arr_term_gate %}
{% set pax = (f.travellers | join(', ')) if f.travellers else '' %}

{% set plane_x = 2 %}
{% if route_state == 'En Route' and dep_primary_src and arr_primary_src %}
  {% set total = as_timestamp(as_datetime(arr_primary_src)) - as_timestamp(as_datetime(dep_primary_src)) %}
  {% set elapsed = as_timestamp(now()) - as_timestamp(as_datetime(dep_primary_src)) %}
  {% if total > 0 %}
    {% set pct = ((elapsed / total) * 100) | round(0) | int %}
    {% if pct < 6 %}{% set plane_x = 6 %}
    {% elif pct > 94 %}{% set plane_x = 94 %}
    {% else %}{% set plane_x = pct %}
    {% endif %}
  {% endif %}
{% elif route_state in ['Arrived', 'Landed'] %}
  {% set plane_x = 100 %}
{% endif %}
{% set plane_transform = "translate(-100%, -50%)" if route_state in ['Arrived', 'Landed'] else "translate(-50%, -50%)" %}
{% set cut_px = 14 %}
{% if route_state == 'En Route' %}
  {% set left_width = "calc(" ~ plane_x ~ "% - " ~ cut_px ~ "px)" %}
  {% set right_left = "calc(" ~ plane_x ~ "% + " ~ cut_px ~ "px)" %}
  {% set right_width = "calc(100% - " ~ plane_x ~ "% - " ~ cut_px ~ "px)" %}
{% elif route_state in ['Arrived', 'Landed'] %}
  {% set left_width = "calc(100% - " ~ cut_px ~ "px)" %}
  {% set right_left = "100%" %}
  {% set right_width = "0%" %}
{% else %}
  {% set left_width = "0%" %}
  {% set right_left = "calc(0% + " ~ cut_px ~ "px)" %}
  {% set right_width = "calc(100% - " ~ cut_px ~ "px)" %}
{% endif %}

<div class='rounded-2xl bg-[rgba(255,255,255,0.04)] overflow-hidden relative'>
  <div class='h-2 {{ route_bg }}'></div>
  {% if aircraft_image %}<img src='{{ aircraft_image }}' class='pointer-events-none absolute inset-0 w-full h-full object-cover object-center opacity-[0.24]' />{% endif %}
  {% if aircraft_image %}<div class='absolute inset-0 bg-[rgba(255,255,255,0.55)] dark:bg-[rgba(0,0,0,0.45)] pointer-events-none'></div>{% endif %}
  <div class='relative z-[1] p-4 space-y-3'>
    <div class='flex items-center gap-3'>
      <img src='{{ logo }}' class='h-12 w-12 object-contain rounded bg-white/90 p-1 ring-1 ring-white/30' />
      <div class='flex-1'>
        <div class='text-lg'>{{ f.get('airline_code','—') }} {{ f.get('flight_number','—') }} · {{ dep_date_display }}</div>
        <div class='text-sm opacity-80'>{{ airline }}{% if ac %} · {{ ac }}{% endif %}{% if delay_minutes is number %} · {{ 'Delayed ' ~ delay_minutes ~ 'm' if delay_minutes > 10 else 'On Time' }}{% endif %}</div>
      </div>
      <span class='text-xs px-2 py-1 rounded-full {{ badge }} text-center'>{{ state }}</span>
    </div>

    <div class='flex items-center gap-2 flex-nowrap'>
      <div class='text-xl sm:text-2xl font-semibold shrink-0 whitespace-nowrap'>{{ dep_code }}</div>
      <div class='flex-1 min-w-0'>
        <div class='relative w-full h-0.5'>
          <div class='absolute left-0 top-0 h-0.5 rounded {{ route_bg }}' style='width: {{ left_width }};'></div>
          <div class='absolute top-0 h-0.5 rounded bg-gray-300/60' style='left: {{ right_left }}; width: {{ right_width }};'></div>
          <div class='absolute {{ route_color }}' style='left: {{ plane_x }}%; top: 50%; transform: {{ plane_transform }}; font-size:18px; font-weight:700;'>✈</div>
        </div>
      </div>
      <div class='text-xl sm:text-2xl font-semibold shrink-0 whitespace-nowrap'>{{ route_arr_code }}</div>
    </div>

    <div class='grid grid-cols-2 gap-x-4 gap-y-1 text-sm'>
      <div class='opacity-80'>{{ dep_city|title }} · {{ dep_date_display }}</div><div class='opacity-80'>{{ arr_city|title }} · {{ arr_date_display }}</div>
      <div class='opacity-70'>{{ 'Departed' if dep.get('actual') else 'Scheduled Departure' }}</div><div class='opacity-70'>{{ 'Estimated Arrival' if (arr.get('actual') or arr.get('estimated')) else 'Scheduled Arrival' }}</div>
      <div class='text-2xl font-semibold {{ time_color }}'>{{ dep_primary }}<span class='text-xs opacity-70 ml-1'>{{ dep_tz }}</span></div>
      <div class='text-2xl font-semibold {{ time_color }}'>{{ arr_primary }}<span class='text-xs opacity-70 ml-1'>{{ arr_tz }}</span></div>
      {% if show_viewer_row %}
      <div class='opacity-70 {% if not dep_viewer %}opacity-0{% endif %}'>{% if dep_viewer %}{{ dep_viewer }} {{ viewer_tz }}{{ dep_viewer_suffix }}{% else %}&nbsp;{% endif %}</div>
      <div class='opacity-70 {% if not arr_viewer %}opacity-0{% endif %}'>{% if arr_viewer %}{{ arr_viewer }} {{ viewer_tz }}{{ arr_viewer_suffix }}{% else %}&nbsp;{% endif %}</div>
      {% endif %}
      {% if show_strike_row %}
      <div class='line-through opacity-50 {% if not dep_changed %}opacity-0{% endif %}'>{% if dep_changed %}{{ dep_strike }}{% else %}&nbsp;{% endif %}</div>
      <div class='line-through opacity-50 {% if not arr_changed %}opacity-0{% endif %}'>{% if arr_changed %}{{ arr_strike }}{% else %}&nbsp;{% endif %}</div>
      {% endif %}
      {% if show_term_gate_row %}
      <div class='opacity-70'>{{ dep_term_gate }}</div>
      <div class='opacity-70'>{{ arr_term_gate }}</div>
      {% endif %}
    </div>

    {% if pax %}<div class='text-sm opacity-80'>Travellers: {{ pax }}</div>{% endif %}

    {% if err or warn or hint %}
    <div class='space-y-2 text-sm'>
      {% if err %}<div class='rounded-xl bg-red-900/70 px-3 py-2 font-medium text-red-100 ring-1 ring-red-400/40'>{{ err }}</div>{% endif %}
      {% if warn %}<div class='rounded-xl bg-amber-900/60 px-3 py-2 text-amber-100 ring-1 ring-amber-400/40'>{{ warn }}</div>{% endif %}
      {% if hint and not err and not warn %}<div class='rounded-xl bg-slate-800/60 px-3 py-2 text-slate-100 ring-1 ring-slate-400/30'>{{ hint }}</div>{% endif %}
    </div>
    {% endif %}
  </div>
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
