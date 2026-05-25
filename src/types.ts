export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  callService: (domain: string, service: string, serviceData?: Record<string, unknown>) => Promise<unknown>;
}

export interface LovelaceCard extends HTMLElement {
  hass?: HomeAssistant;
  setConfig: (config: Record<string, unknown>) => void;
  getCardSize?: () => number;
}

export interface FlightRecord {
  flight_key?: string;
  id?: string;
  airline?: string;
  flight_number?: string;
  status?: string;
  dep?: { airport_name?: string; airport_iata?: string; scheduled_utc?: string };
  arr?: { airport_name?: string; airport_iata?: string; scheduled_utc?: string };
}
