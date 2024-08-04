import { EventFilter } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-filter-manager";
import { createNumberFilter } from "./filter-factory";
import { MidiEvent } from "../event-source";

export const midiControlValueFilter = createNumberFilter({
  id: "ebiggz:midi-control-value-filter",
  name: "Control Value",
  description: "Filter events by the MIDI CC value",
  events: [MidiEvent.ControlChange].map((e) => ({
    eventSourceId: "ebiggz:midi",
    eventId: e,
  })),
  eventMetaKey: "value",
}) as any as EventFilter;
