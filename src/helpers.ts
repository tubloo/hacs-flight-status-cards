import { FlightRecord, HassEntity, HomeAssistant } from "./types";

export const DEFAULT_SUMMARY_ENTITY = "sensor.flight_status_tracker_upcoming_flights";

export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function getSummary(hass: HomeAssistant, entityId: string): HassEntity | undefined {
  return hass.states[entityId];
}

export function findFlightEntities(hass: HomeAssistant): HassEntity[] {
  return Object.values(hass.states).filter((e) => {
    if (!e.entity_id.startsWith("sensor.")) return false;
    const attrs = e.attributes || {};
    return typeof attrs.flight_key === "string" && typeof attrs.flight === "object";
  });
}

export function readFlight(entity: HassEntity): FlightRecord | null {
  const flight = entity.attributes?.flight;
  if (!flight || typeof flight !== "object") return null;
  return flight as FlightRecord;
}

export function formatWhen(value?: string): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}
