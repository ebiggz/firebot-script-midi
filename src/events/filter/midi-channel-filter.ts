import { EventFilter } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-filter-manager";
import { createNumberFilter } from "./filter-factory";
import { MidiEvent } from "../event-source";

export const midiChannelFilter = createNumberFilter({
  id: "ebiggz:midi-channel-filter",
  name: "Channel",
  description: "Filter events by the MIDI channel",
  events: [
    MidiEvent.NoteOn,
    MidiEvent.NoteOff,
    MidiEvent.Pitch,
    MidiEvent.ControlChange,
  ].map((e) => ({
    eventSourceId: "ebiggz:midi",
    eventId: e,
  })),
  eventMetaKey: "channel",
}) as any as EventFilter;
