import { EventFilter } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-filter-manager";
import { createNumberFilter } from "./filter-factory";
import { MidiEvent } from "../event-source";

export const midiPitchFilter = createNumberFilter({
  id: "ebiggz:midi-pitch-filter",
  name: "Pitch",
  description: "Filter events by the MIDI pitch value",
  events: [MidiEvent.Pitch].map((e) => ({
    eventSourceId: "ebiggz:midi",
    eventId: e,
  })),
  eventMetaKey: "value",
}) as any as EventFilter;
