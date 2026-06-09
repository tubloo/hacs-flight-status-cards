import { HomeAssistant, LovelaceCard } from "../types";

interface ListConfig {
  title?: string;
  show_background_image?: boolean;
  max_flights?: number;
  sort_by?: "departure" | "arrival";
  ui_refresh_seconds?: number;
}

type CardHelpers = {
  createCardElement: (config: Record<string, unknown>) => LovelaceCard;
};

class FlightStatusTrackerListCard extends HTMLElement implements LovelaceCard {
  static getConfigElement(): HTMLElement {
    return document.createElement("flight-status-tracker-list-card-editor");
  }

  static getStubConfig(): Record<string, unknown> {
    return {};
  }

  private _config: ListConfig = {};
  private _hass?: HomeAssistant;
  private _card?: LovelaceCard;

  setConfig(config: ListConfig): void {
    this._config = config || {};
    void this.buildCard();
  }

  set hass(hass: HomeAssistant | undefined) {
    this._hass = hass;
    if (!this._card || !hass) return;
    this._card.hass = hass;
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
    const title = this._config.title || "Flight List";
    const showBackgroundImage = this._config.show_background_image !== false;
    const sortBy = this._config.sort_by === "arrival" ? "arrival" : "departure";
    const sortAttr = sortBy === "arrival" ? "attributes.arr_scheduled" : "attributes.dep_scheduled";
    const maxFlights =
      typeof this._config.max_flights === "number" && Number.isFinite(this._config.max_flights)
        ? Math.max(1, Math.floor(this._config.max_flights))
        : null;

    const config: Record<string, unknown> = {
      type: "vertical-stack",
      cards: [
        {
          type: "custom:tailwindcss-template-card",
          content: `{% set max_flights = ${maxFlights ?? "none"} %}
{% set flight_entity_ids = state_attr('sensor.flight_status_tracker_upcoming_flights','flight_entity_ids') or [] %}
{% set entries = expand(flight_entity_ids) | selectattr('attributes.flight_key', 'defined') | list %}
{% set entries_sorted = entries | sort(attribute='${sortAttr}') %}
{% if max_flights is not none %}
  {% set entries_display = entries_sorted[:max_flights] %}
{% else %}
  {% set entries_display = entries_sorted %}
{% endif %}
<div class="text-2xl font-semibold">
  ${title} ({{ entries_display | count }})
</div>`,
        },
        {
          type: "custom:auto-entities",
          card: {
            type: "vertical-stack",
          },
          card_param: "cards",
          filter: {
            template: `{% set show_aircraft_image = ${showBackgroundImage ? "true" : "false"} %}
{% set flight_entity_ids = state_attr('sensor.flight_status_tracker_upcoming_flights','flight_entity_ids') or [] %}
{% set entries = expand(flight_entity_ids) | selectattr('attributes.flight_key', 'defined') | list %}
{% set entries = entries | sort(attribute='${sortAttr}') %}
{% set max_flights = ${maxFlights ?? "none"} %}
{% if max_flights is not none %}
  {% set entries = entries[:max_flights] %}
{% endif %}
[ {% for s in entries %}
  {%- set f = s.attributes.flight or {} -%}
  {%- set ui = s.attributes.ui or f.ui or {} -%}
  {%- set dep = f.dep or {} -%}
  {%- set arr = f.arr or {} -%}
  {%- set dep_air = dep.airport or {} -%}
  {%- set arr_air = arr.airport or {} -%}

  {%- set badge_key = ui.badge_key or 'neutral' -%}
  {%- set state = ui.state_label or (f.status_state or 'Unknown') -%}
  {%- set route_state = ui.route_state or state -%}
  {%- set raw_status = ui.provider_state_label -%}

  {%- set badge = 'bg-gray-600 text-white' -%}
  {%- set route_color = 'text-gray-400' -%}
  {%- set time_color = 'text-gray-300' -%}
  {%- if badge_key == 'critical' or route_state in ['Cancelled', 'Diverted'] -%}
    {%- set badge = 'bg-red-800 text-white' -%}
    {%- set route_color = 'text-red-700' -%}
    {%- set time_color = 'text-red-600' -%}
  {%- elif badge_key == 'ok' or route_state == 'Arrived' -%}
    {%- set badge = 'bg-emerald-800 text-white' -%}
    {%- set route_color = 'text-emerald-700' -%}
    {%- set time_color = 'text-emerald-600' -%}
  {%- endif -%}
  {%- set route_bg = route_color | replace('text-','bg-') -%}

  {%- set dep_code = ui.dep_code or (dep_air.iata or '—') | upper -%}
  {%- set arr_code = ui.arr_code or (arr_air.iata or '—') | upper -%}
  {%- set route_arr_code = ui.route_arr_code or arr_code -%}

  {%- set dep_label_line = ui.dep_label_line or ((dep_air.city or dep_air.name or dep_code) ~ ' · —') -%}
  {%- set arr_label_line = ui.arr_label_line or ((arr_air.city or arr_air.name or arr_code) ~ ' · —') -%}

  {%- set dep_primary = ui.dep_time_primary or '—' -%}
  {%- set arr_primary = ui.arr_time_primary or '—' -%}
  {%- set dep_strike = ui.dep_time_strike -%}
  {%- set arr_strike = ui.arr_time_strike -%}
  {%- set dep_changed = ui.dep_changed | default(false) -%}
  {%- set arr_changed = ui.arr_changed | default(false) -%}
  {%- set show_strike_row = dep_changed or arr_changed -%}

  {%- set dep_tz = ui.dep_tz_short or dep_air.tz_short or '' -%}
  {%- set arr_tz = ui.arr_tz_short or arr_air.tz_short or '' -%}
  {%- set viewer_tz = ui.viewer_tz_short or '' -%}

  {%- set dep_viewer = ui.dep_viewer_time -%}
  {%- set arr_viewer = ui.arr_viewer_time -%}
  {%- set show_dep_viewer = ui.show_dep_viewer | default(false) -%}
  {%- set show_arr_viewer = ui.show_arr_viewer | default(false) -%}
  {%- set show_viewer_row = ui.show_viewer_row | default(false) -%}

  {%- set dep_term_gate = ui.dep_term_gate or '' -%}
  {%- set arr_term_gate = ui.arr_term_gate or '' -%}
  {%- set show_term_gate_row = ui.show_term_gate_row | default(false) -%}
  {%- set dep_ops_line = ui.dep_ops_line or '' -%}
  {%- set arr_ops_line = ui.arr_ops_line or '' -%}
  {%- set show_ops_row = ui.show_ops_row | default(false) -%}
  {%- set dep_movement_line = ui.dep_movement_line or '' -%}
  {%- set arr_movement_line = ui.arr_movement_line or '' -%}
  {%- set show_movement_row = ui.show_movement_row | default(false) -%}
  {%- set position_line = ui.position_line -%}
  {%- set show_position_row = ui.show_position_row | default(false) -%}

  {%- set pct = ui.route_progress_at_poll_pct or 0 -%}
  {%- if pct < 0 %}{% set pct = 0 %}{% endif -%}
  {%- if pct > 100 %}{% set pct = 100 %}{% endif -%}

  {%- if route_state == 'En Route' -%}
    {%- set pct_gap = 6 if pct < 6 else (94 if pct > 94 else pct) -%}
    {%- set plane_x = pct_gap -%}
  {%- elif route_state == 'Arrived' -%}
    {%- set plane_x = 100 -%}
  {%- else -%}
    {%- set plane_x = 2 -%}
  {%- endif -%}

  {%- if route_state == 'Arrived' -%}
    {%- set plane_transform = "translate(-100%, -50%)" -%}
  {%- else -%}
    {%- set plane_transform = "translate(-50%, -50%)" -%}
  {%- endif -%}

  {%- set plane_w_px = 22 -%}
  {%- set gap_px = 3 -%}
  {%- set sched_extra_px = 7 -%}
  {%- set arrived_extra_px = 6 -%}
  {%- set base_cut = (plane_w_px / 2) + gap_px -%}
  {%- if route_state == 'Scheduled' -%}
    {%- set cut_px = base_cut + sched_extra_px -%}
  {%- elif route_state == 'Arrived' -%}
    {%- set cut_px = base_cut + arrived_extra_px -%}
  {%- else -%}
    {%- set cut_px = base_cut -%}
  {%- endif -%}

  {%- if route_state == 'En Route' -%}
    {%- set left_width = "calc(" ~ plane_x ~ "% - " ~ cut_px ~ "px)" -%}
    {%- set right_left = "calc(" ~ plane_x ~ "% + " ~ cut_px ~ "px)" -%}
    {%- set right_width = "calc(100% - " ~ plane_x ~ "% - " ~ cut_px ~ "px)" -%}
  {%- elif route_state == 'Arrived' -%}
    {%- set left_width = "calc(100% - " ~ cut_px ~ "px)" -%}
    {%- set right_left = "100%" -%}
    {%- set right_width = "0%" -%}
  {%- else -%}
    {%- set left_width = "0%" -%}
    {%- set right_left = "calc(0% + " ~ cut_px ~ "px)" -%}
    {%- set right_width = "calc(100% - " ~ cut_px ~ "px)" -%}
  {%- endif -%}

  {%- set remaining_label = None -%}

  {%- set updated_ago = ui.updated_ago_min -%}
  {%- set updated_label = '—' -%}
  {%- if updated_ago is number -%}
    {%- set mins = updated_ago | int -%}
    {%- if mins <= 0 -%}
      {%- set updated_label = 'just now' -%}
    {%- elif mins < 60 -%}
      {%- set updated_label = mins ~ ' min ago' -%}
    {%- elif mins < 1440 -%}
      {%- set hrs = (mins / 60) | round(0, 'floor') | int -%}
      {%- set updated_label = hrs ~ ' hr ago' -%}
    {%- else -%}
      {%- set days = (mins / 1440) | round(0, 'floor') | int -%}
      {%- set updated_label = days ~ (' day ago' if days == 1 else ' days ago') -%}
    {%- endif -%}
  {%- endif -%}
  {%- set next_update_in = ui.next_update_in_min -%}
  {%- set next_update_label = '—' -%}
  {%- if route_state in ['Arrived', 'Cancelled'] -%}
    {%- set next_update_label = 'No further updates' -%}
  {%- elif next_update_in is number -%}
    {%- set mins = next_update_in | int -%}
    {%- if mins <= 0 -%}
      {%- set next_update_label = 'due now' -%}
    {%- elif mins < 60 -%}
      {%- set next_update_label = 'in ' ~ mins ~ ' min' -%}
    {%- elif mins < 1440 -%}
      {%- set hrs = (mins / 60) | round(0, 'floor') | int -%}
      {%- set rem = mins % 60 -%}
      {%- set next_update_label = 'in ' ~ hrs ~ ' hr' ~ (' ' ~ rem ~ ' min' if rem else '') -%}
    {%- else -%}
      {%- set days = (mins / 1440) | round(0, 'floor') | int -%}
      {%- set next_update_label = 'in ' ~ days ~ (' day' if days == 1 else ' days') -%}
    {%- endif -%}
  {%- endif -%}
  {%- set source = ui.source or '—' -%}
  {%- set status_error_text = ui.status_error_text -%}
  {%- set show_error = status_error_text -%}

  {%- set pax = (f.travellers | join(', ')) if f.travellers else '' -%}
  {%- set airline_logo = f.airline_logo_url or ("https://pics.avs.io/64/64/" ~ (f.airline_code | default('') | upper) ~ ".png") -%}
  {%- set aircraft_image = f.aircraft_image_url -%}
  {%- set airline_name = f.airline_name or '' -%}
  {%- set dep_date_display = (ui.dep_label_line and ui.dep_label_line.split(' · ')[1]) if (ui.dep_label_line and ' · ' in ui.dep_label_line) else '—' -%}

  {
    "type": "custom:tailwindcss-template-card",
    "entity": "{{ s.entity_id }}",
    "content": "<div class='relative overflow-hidden rounded-2xl bg-[rgba(255,255,255,0.04)]'>\\
    <div class='h-2 {{ route_bg }}'></div>\\
    <div class='px-4 pt-3 pb-4 space-y-3'>\\
    {% if show_aircraft_image and aircraft_image %}<img src='{{ aircraft_image }}' class='pointer-events-none absolute inset-0 w-full h-full object-cover object-center opacity-[0.24]' />{% endif %}\\
    {% if show_aircraft_image and aircraft_image %}<div class='absolute inset-0 bg-[rgba(255,255,255,0.55)] dark:bg-[rgba(0,0,0,0.45)] pointer-events-none'></div>{% endif %}\\
    <div class='relative z-[1]'>\\
    <div class='flex items-center gap-3'>\\
      <img src='{{ airline_logo }}' class='h-12 w-12 object-contain rounded bg-white/90 p-1 ring-1 ring-white/30' />\\
      <div class='flex-1'>\\
        <div class='text-lg'>{{ f.airline_code }} {{ f.flight_number }} · {{ dep_date_display }}</div>\\
        <div class='text-sm opacity-80'>{{ airline_name }}{% if f.aircraft_type %} · {{ f.aircraft_type }}{% endif %}{% if f.duration_minutes is not none %} · {{ (f.duration_minutes or 0) // 60 }}h {{ (f.duration_minutes or 0) % 60 }}m{% endif %}</div>\\
      </div>\\
      <div class='shrink-0 text-center'>\\
        <span class='text-xs px-2 py-1 rounded-full {{ badge }} inline-block'>\\
          <div class='leading-tight'>{{ state }}</div>\\
          {% if remaining_label %}<div class='leading-tight opacity-90'>{{ remaining_label }} left</div>{% endif %}\\
        </span>\\
        {% if raw_status %}<div class='text-[11px] mt-1 font-medium {{ route_color }}'>{{ raw_status }}</div>{% endif %}\
      </div>\\
    </div>\\
    <div class='flex items-center gap-2 flex-nowrap'>\\
      <div class='text-xl sm:text-2xl font-semibold shrink-0 whitespace-nowrap'>{{ dep_code }}</div>\\
      <div class='flex-1 min-w-0'>\\
        <div class='relative w-full h-0.5'>\\
          <div class='absolute left-0 top-0 h-0.5 rounded {{ route_bg }}' style='width: {{ left_width }};'></div>\\
          <div class='absolute top-0 h-0.5 rounded bg-gray-300/60' style='left: {{ right_left }}; width: {{ right_width }};'></div>\\
          <div class='absolute {{ route_color }}' style='left: {{ plane_x }}%; top: 50%; transform: {{ plane_transform }}; font-size:18px; font-weight:700;'>✈</div>\\
        </div>\\
      </div>\\
      <div class='text-xl sm:text-2xl font-semibold shrink-0 whitespace-nowrap'>{{ route_arr_code }}</div>\\
    </div>\\
    <div class='grid grid-cols-2 gap-x-4 gap-y-1 text-sm'>\\
      <div class='opacity-80'>{{ dep_label_line }}</div><div class='opacity-80'>{{ arr_label_line }}</div>\\
      <div class='opacity-70'>{{ 'Departed' if dep.get('actual') else 'Scheduled Departure' }}</div><div class='opacity-70'>{{ 'Estimated Arrival' if (arr.get('actual') or arr.get('estimated')) else 'Scheduled Arrival' }}</div>\\
      <div class='text-2xl font-semibold {{ time_color }}'>{{ dep_primary }}<span class='text-xs opacity-70 ml-1'>{{ dep_tz }}</span></div>\\
      <div class='text-2xl font-semibold {{ time_color }}'>{{ arr_primary }}<span class='text-xs opacity-70 ml-1'>{{ arr_tz }}</span></div>\\
      {% if show_strike_row %}\\
      <div class='line-through opacity-50 {% if not dep_changed %}opacity-0{% endif %}'>{% if dep_changed %}{{ dep_strike }}{% else %}&nbsp;{% endif %}</div>\\
      <div class='line-through opacity-50 {% if not arr_changed %}opacity-0{% endif %}'>{% if arr_changed %}{{ arr_strike }}{% else %}&nbsp;{% endif %}</div>\\
      {% endif %}\\
      {% if show_viewer_row %}\\
      <div class='opacity-70 {% if not show_dep_viewer %}opacity-0{% endif %}'>{% if show_dep_viewer %}{{ dep_viewer }} {{ viewer_tz }}{% else %}&nbsp;{% endif %}</div>\\
      <div class='opacity-70 {% if not show_arr_viewer %}opacity-0{% endif %}'>{% if show_arr_viewer %}{{ arr_viewer }} {{ viewer_tz }}{% else %}&nbsp;{% endif %}</div>\\
      {% endif %}\\
      {% if show_term_gate_row %}\\
      <div class='opacity-70'>{{ dep_term_gate }}</div>\\
      <div class='opacity-70'>{{ arr_term_gate }}</div>\\
      {% endif %}\\
    </div>\\
    {% if pax %}<div class='text-sm opacity-80'>Travellers: {{ pax }}</div>{% endif %}\\
    {% if show_error %}\\
    <div class='text-[11px] text-amber-200 bg-amber-900/40 px-2 py-1 rounded-md'>\\
      Provider issue: {{ status_error_text }}\\
    </div>\\
    {% endif %}\\
    <div class='text-xs opacity-60'>Updated {{ updated_label }} · Source: {{ source }}</div>\\
    <div class='text-xs font-semibold text-sky-300'>Next update: {{ next_update_label }}</div>\\
    </div>\\
    </div>\\
  </div>"
  }{{ "," if not loop.last else "" }}
{% endfor %} ]`,
          },
        },
      ],
    };

    this._card = helpers.createCardElement(config);
    if (this._hass) this._card.hass = this._hass;
    this.replaceChildren(this._card);
  }

  getCardSize(): number {
    return 7;
  }
}

if (!customElements.get("flight-status-tracker-list-card")) {
  customElements.define("flight-status-tracker-list-card", FlightStatusTrackerListCard);
}
