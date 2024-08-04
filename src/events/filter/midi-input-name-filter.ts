import { EventFilter } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-filter-manager";
import { MidiEvent, MidiEventSourceId } from "../event-source";

export const midiInputNameFilter: EventFilter = {
  id: "ebiggz:midi-input-name-filter",
  name: "MIDI Device",
  description: "Filter events by the name of the MIDI input device",
  events: [
    MidiEvent.NoteOn,
    MidiEvent.NoteOff,
    MidiEvent.Pitch,
    MidiEvent.ControlChange,
  ].map((e) => ({
    eventSourceId: MidiEventSourceId,
    eventId: e,
  })),
  comparisonTypes: ["is", "is not"],
  valueType: "preset",
  presetValues: (backendCommunicator) =>
    backendCommunicator
      .fireEventAsync("ebiggz-midi-input-names")
      .then((inputNames: string[]) =>
        inputNames.map((n) => ({
          value: n,
          display: n,
        }))
      ),
  predicate: async ({ comparisonType, value }, { eventMeta }) => {
    const midiInputName = eventMeta.midiInputName;
    if (!midiInputName) {
      return false;
    }
    switch (comparisonType) {
      case "is":
        return midiInputName === value;
      case "is not":
        return midiInputName !== value;
      default:
        return false;
    }
  },
};
