import { EventFilter } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-filter-manager";
import { createNumberFilter } from "./filter-factory";
import { MidiEvent } from "../event-source";

export const midiNoteFilter = createNumberFilter({
  id: "ebiggz:midi-note-filter",
  name: "Note",
  description: "Filter events by the MIDI note number",
  events: [MidiEvent.NoteOn, MidiEvent.NoteOff].map((e) => ({
    eventSourceId: "ebiggz:midi",
    eventId: e,
  })),
  eventMetaKey: "note",
}) as any as EventFilter;
