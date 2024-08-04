import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import {
  closeVirtualMidiOutputs,
  setNewOutputs,
  setupMidi,
} from "./midi-handler";
import { midiEventSource } from "./events/event-source";
import { buildMidiEventVariables } from "./variables/midi-variable-factory";
import { midiNoteFilter } from "./events/filter/midi-note-filter";
import { midiPitchFilter } from "./events/filter/midi-pitch-filter";
import { midiVelocityFilter } from "./events/filter/midi-velocity-filter";
import { midiChannelFilter } from "./events/filter/midi-channel-filter";
import { midiControllerFilter } from "./events/filter/midi-controller-filter";
import { midiInputNameFilter } from "./events/filter/midi-input-name-filter";
import { midiControlValueFilter } from "./events/filter/midi-control-value-filter";
import { initLogger } from "./logger";
import { sendMidiOutputEffectType } from "./effects/send-midi-output";

const script: Firebot.CustomScript<{
  refreshInputs: void;
  virtualOutputNames: string[];
}> = {
  getScriptManifest: () => {
    return {
      name: "Firebot MIDI",
      description:
        "Adds events for MIDI note on/off and an effect to send MIDI notes to a virtual MIDI device",
      author: "ebiggz",
      version: "1.0",
      firebotVersion: "5",
    };
  },
  getDefaultParameters: () => {
    return {
      virtualOutputNames: {
        type: "editable-list",
        title: "Virtual MIDI Outputs",
        description:
          "A list of virtual MIDI output names that you can send MIDI events to.",
        settings: {
          addLabel: "Add Virtual Output",
          editLabel: "Edit Virtual Output",
          noneAddedText: "No virtual outputs added",
          sortable: false,
          useTextArea: false,
          noDuplicates: true,
        },
        default: ["Firebot Virtual Out"],
      },
      refreshInputs: {
        type: "button",
        title: "Refresh MIDI Device Listeners",
        description:
          "Firebot sets up MIDI device listeners on startup, but if you connect a new MIDI device after Firebot has started, you can use this button to force a refresh.",
        backendEventName: "ebiggz:midi:refresh-input-listeners",
        buttonText: "Refresh MIDI Devices",
        icon: "fa-sync",
      },
    };
  },
  run: async (runRequest) => {
    initLogger(runRequest.modules.logger);

    const {
      effectManager,
      eventManager,
      eventFilterManager,
      replaceVariableManager,
      replaceVariableFactory,
      frontendCommunicator,
    } = runRequest.modules;

    effectManager.registerEffect(sendMidiOutputEffectType);

    eventManager.registerEventSource(midiEventSource);

    eventFilterManager.registerFilter(midiInputNameFilter);
    eventFilterManager.registerFilter(midiNoteFilter);
    eventFilterManager.registerFilter(midiVelocityFilter);
    eventFilterManager.registerFilter(midiPitchFilter);
    eventFilterManager.registerFilter(midiChannelFilter);
    eventFilterManager.registerFilter(midiControllerFilter);
    eventFilterManager.registerFilter(midiControlValueFilter);

    const midiEventVariables = buildMidiEventVariables(replaceVariableFactory);
    for (const variable of midiEventVariables) {
      replaceVariableManager.registerReplaceVariable(variable);
    }

    await setupMidi(
      frontendCommunicator,
      eventManager,
      runRequest.parameters.virtualOutputNames ?? []
    );
  },
  parametersUpdated(parameters) {
    setNewOutputs(parameters.virtualOutputNames);
  },
  async stop() {
    await closeVirtualMidiOutputs();
  },
};

export default script;
