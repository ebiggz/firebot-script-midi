import { EventFilter } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-filter-manager";
import { createNumberFilter } from "./filter-factory";
import { MidiEvent } from "../event-source";

export const midiControllerFilter = createNumberFilter({
  id: "ebiggz:midi-controller-filter",
  name: "Controller",
  description: "Filter events by the MIDI CC controller value",
  events: [MidiEvent.ControlChange].map((e) => ({
    eventSourceId: "ebiggz:midi",
    eventId: e,
  })),
  eventMetaKey: "controller",
}) as any as EventFilter;
