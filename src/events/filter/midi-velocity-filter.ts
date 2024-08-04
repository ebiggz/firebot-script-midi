import { EventFilter } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-filter-manager";
import { createNumberFilter } from "./filter-factory";
import { MidiEvent } from "../event-source";

export const midiVelocityFilter = createNumberFilter({
  id: "ebiggz:midi-velocity-filter",
  name: "Velocity",
  description: "Filter events by the MIDI note velocity",
  events: [MidiEvent.NoteOn, MidiEvent.NoteOff].map((e) => ({
    eventSourceId: "ebiggz:midi",
    eventId: e,
  })),
  eventMetaKey: "velocity",
}) as any as EventFilter;
