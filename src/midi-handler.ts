import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import {
  ControlChange,
  Input as MidiInput,
  Output as MidiOutput,
  Note,
  Pitch,
  getInputs as getMidiInputNames,
} from "easymidi";
import { MidiEvent, MidiEventSourceId } from "./events/event-source";
import { logger } from "./logger";

let midiPortCheckInterval: NodeJS.Timeout;

let inputs: MidiInput[] = [];

let outputs: MidiOutput[] = [];

export async function setupMidi(
  frontendCommunicator: ScriptModules["frontendCommunicator"],
  eventManager: ScriptModules["eventManager"],
  outputNames: string[]
) {
  if (midiPortCheckInterval) {
    clearInterval(midiPortCheckInterval);
  }

  for (const output of outputs) {
    output?.close();
  }
  outputs = [];

  for (const outputName of outputNames) {
    const output = new MidiOutput(outputName, true);
    outputs.push(output);
  }

  frontendCommunicator.onAsync(
    "ebiggz:midi:refresh-input-listeners",
    async () => {
      refreshInputListeners(eventManager, frontendCommunicator, true);
    }
  );

  frontendCommunicator.onAsync("ebiggz-midi-input-names", async () =>
    getMidiInputNames()
  );

  frontendCommunicator.onAsync(
    "ebiggz-midi-output-names",
    async () => outputs?.map((o) => o.name) ?? []
  );

  refreshInputListeners(eventManager, frontendCommunicator);

  midiPortCheckInterval = setInterval(() => {
    const inputNames = getMidiInputNames();
    if (inputNames.length !== inputs.length) {
      refreshInputListeners(eventManager, frontendCommunicator, true);
    }
  }, 1000);
}

const refreshInputListeners = (
  eventManager: ScriptModules["eventManager"],
  frontendCommunicator: ScriptModules["frontendCommunicator"],
  sendToast = false
) => {
  const previousInputCount = inputs.length;
  if (inputs.length > 0) {
    for (const input of inputs) {
      input.removeAllListeners();
    }
    inputs = [];
  }

  const midiInputNames = getMidiInputNames();

  logger.debug("MIDI Inputs", midiInputNames);

  for (const inputName of midiInputNames) {
    const midiInput = new MidiInput(inputName);
    midiInput.on("noteon", (note) => {
      eventManager.triggerEvent(MidiEventSourceId, MidiEvent.NoteOn, {
        midiInputName: inputName,
        ...note,
      });
    });
    midiInput.on("noteoff", (note) => {
      eventManager.triggerEvent(MidiEventSourceId, MidiEvent.NoteOff, {
        midiInputName: inputName,
        ...note,
      });
    });
    midiInput.on("pitch", (pitch) => {
      eventManager.triggerEvent(MidiEventSourceId, MidiEvent.Pitch, {
        midiInputName: inputName,
        ...pitch,
      });
    });
    midiInput.on("cc", (cc) => {
      eventManager.triggerEvent(MidiEventSourceId, MidiEvent.ControlChange, {
        midiInputName: inputName,
        ...cc,
      });
    });
    inputs.push(midiInput);
  }

  if (sendToast) {
    const newInputCount = midiInputNames.length;
    const someInputsMessage = (didChange: boolean) =>
      `${newInputCount} device${newInputCount === 1 ? "" : "s"} ${
        didChange ? "now detected" : "detected"
      } (${midiInputNames.join(", ")})`;

    if (newInputCount != previousInputCount) {
      if (newInputCount > 0) {
        frontendCommunicator.send("showToast", {
          className: "success",
          content: `MIDI device change: ${someInputsMessage(true)}`,
        });
      } else {
        frontendCommunicator.send(
          "showToast",
          "MIDI device change: None detected"
        );
      }
    } else if (newInputCount === 0) {
      frontendCommunicator.send("showToast", "No MIDI devices detected");
    } else {
      if (newInputCount > 0) {
        frontendCommunicator.send("showToast", {
          className: "info",
          content: `MIDI: ${someInputsMessage(false)}`,
        });
      } else {
        frontendCommunicator.send("showToast", "MIDI: No devices detected");
      }
    }
  }
};

export enum MidiOutputEvent {
  NoteOn = "noteon",
  NoteOff = "noteoff",
  Pitch = "pitch",
  ControlChange = "cc",
}

type MidiEventKeyValueMap = {
  [MidiOutputEvent.NoteOn]: Note;
  [MidiOutputEvent.NoteOff]: Note;
  [MidiOutputEvent.Pitch]: Pitch;
  [MidiOutputEvent.ControlChange]: ControlChange;
};

export async function sendMidiEventToOutput<E extends MidiOutputEvent>(
  output: string | boolean,
  event: E,
  data: MidiEventKeyValueMap[E]
) {
  if (typeof output === "boolean") {
    for (const output of outputs) {
      output.send(event as any, data as any);
    }
    logger.debug(`Sent MIDI event to all outputs: ${event}`, data);
    return;
  }

  const firebotVirtualMidiOutput = outputs.find((o) => o.name === output);
  if (!firebotVirtualMidiOutput) {
    logger.error(`Virtual MIDI output not found: ${output}`);
    return;
  }

  firebotVirtualMidiOutput?.send(event as any, data as any);
  logger.debug(`Sent MIDI event to virtual output "${output}": ${event}`, data);
}

export async function closeVirtualMidiOutputs() {
  for (const input of inputs) {
    input.removeAllListeners();
  }
  inputs = [];

  for (const output of outputs) {
    output?.close();
  }
  outputs = [];

  clearInterval(midiPortCheckInterval);
}

export async function setNewOutputs(outputNames: string[]) {
  for (const output of outputs) {
    output?.close();
  }
  outputs = [];

  for (const outputName of outputNames) {
    const output = new MidiOutput(outputName, true);
    outputs.push(output);
  }
}
