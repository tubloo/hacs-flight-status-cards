import "./cards/flight-list-card";
import "./cards/add-flight-card";
import "./cards/remove-flight-card";
import "./cards/diagnostics-control-card";

const cards = [
  {
    type: "flight-status-tracker-list-card",
    name: "Flight List",
    description: "Lists tracked flights from Flight Status Tracker",
    preview: true,
  },
  {
    type: "flight-status-tracker-add-card",
    name: "Add Flight",
    description: "Preview and confirm adding a flight",
    preview: true,
  },
  {
    type: "flight-status-tracker-remove-card",
    name: "Remove Flight",
    description: "Select and remove a tracked flight",
    preview: true,
  },
  {
    type: "flight-status-tracker-diagnostics-card",
    name: "Diagnostics & Control",
    description: "API diagnostics and control actions",
    preview: true,
  },
];

const windowAny = window as unknown as { customCards?: Array<Record<string, unknown>> };
const existing = windowAny.customCards || [];
const existingTypes = new Set(existing.map((c) => String(c.type || "")));
const additions = cards.filter((c) => !existingTypes.has(String(c.type || "")));
windowAny.customCards = [...existing, ...additions];
