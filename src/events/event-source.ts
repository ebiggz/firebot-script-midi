import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { RunningScriptInNewContextOptions } from "vm";

type EventSource = Parameters<
  ScriptModules["eventManager"]["registerEventSource"]
>[0];

export const MidiEventSourceId = "ebiggz:midi";
export enum MidiEvent {
  NoteOn = "noteon",
  NoteOff = "noteoff",
  Pitch = "pitch",
  ControlChange = "cc",
}

export const midiEventSource: EventSource = {
  id: MidiEventSourceId,
  name: "MIDI",
  events: [
    {
      id: MidiEvent.NoteOn,
      name: "Note On",
      description: "Fires when a MIDI note is pressed",
      manualMetadata: {
        note: 60,
        velocity: 127,
        channel: 0,
      },
    },
    {
      id: MidiEvent.NoteOff,
      name: "Note Off",
      description: "Fires when a MIDI note is released",
      manualMetadata: {
        note: 60,
        velocity: 127,
        channel: 0,
      },
    },
    {
      id: MidiEvent.Pitch,
      name: "Pitch",
      description: "Fires when a MIDI pitch bend event is received",
      manualMetadata: {
        value: 0,
        channel: 0,
      },
    },
    {
      id: MidiEvent.ControlChange,
      name: "Control Change",
      description: "Fires when a MIDI control change event is received",
      manualMetadata: {
        controller: 0,
        value: 0,
        channel: 0,
      },
    },
  ],
};
