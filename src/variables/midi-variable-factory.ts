import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import { MidiEvent, MidiEventSourceId } from "../events/event-source";

export function buildMidiEventVariables(
  variableFactory: ScriptModules["replaceVariableFactory"]
): ReplaceVariable[] {
  return [
    variableFactory.createEventDataVariable({
      handle: "midiInputName",
      description: "The name of the MIDI input device",
      eventMetaKey: "midiInputName",
      events: getEventIdNameKeys([
        MidiEvent.NoteOn,
        MidiEvent.NoteOff,
        MidiEvent.Pitch,
        MidiEvent.ControlChange,
      ]),
      type: "text",
    }),
    variableFactory.createEventDataVariable({
      handle: "midiNote",
      description: "The MIDI note number (0 to 127)",
      eventMetaKey: "note",
      events: getEventIdNameKeys([MidiEvent.NoteOn, MidiEvent.NoteOff]),
      type: "number",
    }),
    variableFactory.createEventDataVariable({
      handle: "midiVelocity",
      description: "The MIDI note velocity (0 to 127)",
      eventMetaKey: "velocity",
      events: getEventIdNameKeys([MidiEvent.NoteOn, MidiEvent.NoteOff]),
      type: "number",
    }),
    variableFactory.createEventDataVariable({
      handle: "midiChannel",
      description: "The MIDI channel (0 to 15)",
      eventMetaKey: "channel",
      events: getEventIdNameKeys([
        MidiEvent.NoteOn,
        MidiEvent.NoteOff,
        MidiEvent.Pitch,
        MidiEvent.ControlChange,
      ]),
      type: "number",
    }),
    variableFactory.createEventDataVariable({
      handle: "midiPitch",
      description: "The MIDI pitch bend value (0 to 16384)",
      eventMetaKey: "value",
      events: getEventIdNameKeys([MidiEvent.Pitch]),
      type: "number",
    }),
    variableFactory.createEventDataVariable({
      handle: "midiController",
      description: "The MIDI CC controller number (0 to 127)",
      eventMetaKey: "controller",
      events: getEventIdNameKeys([MidiEvent.ControlChange]),
      type: "number",
    }),
    variableFactory.createEventDataVariable({
      handle: "midiControlValue",
      description: "The MIDI CC value (0 to 127)",
      eventMetaKey: "value",
      events: getEventIdNameKeys([MidiEvent.ControlChange]),
      type: "number",
    }),
  ];
}

function getEventIdNameKeys(midiEvents: MidiEvent[]) {
  return midiEvents.map((e) => `${MidiEventSourceId}:${e}`);
}
