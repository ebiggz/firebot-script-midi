import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { MidiOutputEvent, sendMidiEventToOutput } from "../midi-handler";
import { logger } from "../logger";
import { Channel } from "easymidi";

type MidiOutputEventData = {
  outputName: string;
  event: MidiOutputEvent | "notepress";
  note?: number;
  velocity?: number;
  noteDuration?: number;
  pitch?: number;
  channel?: number;
  ccController?: number;
  ccValue?: number;
};

export const sendMidiOutputEffectType: Firebot.EffectType<MidiOutputEventData> =
  {
    definition: {
      id: "ebiggz:send-midi-output",
      name: "Send MIDI Output",
      description: "Send a MIDI event to the virtual MIDI output",
      icon: "fad fa-piano-keyboard",
      categories: ["advanced"],
    },
    optionsTemplate: `
    <eos-container header="MIDI Output">
      <firebot-searchable-select
        items="outputs"
        ng-model="effect.outputName"
        placeholder="Select output"
      ></firebot-searchable-select>
    </eos-container>

    <eos-container header="MIDI Event" pad-top="true" ng-if="effect.outputName != null">
      <firebot-searchable-select
        items="events"
        ng-model="effect.event"
        placeholder="Select event"
      ></firebot-searchable-select>
    </eos-container>
    <eos-container header="Data" ng-if="effect.event != null" pad-top="true">

      <firebot-input
        ng-if="effect.event === 'notepress' || effect.event === 'noteon' || effect.event === 'noteoff'"
        input-title="Note"
        placeholder-text="Enter note number (0-127)"
        model="effect.note"
        data-type="number"
      ></firebot-input>

      <firebot-input
        ng-if="effect.event === 'notepress' || effect.event === 'noteon' || effect.event === 'noteoff'"
        input-title="Velocity"
        placeholder-text="Enter velocity value (0-127)"
        model="effect.velocity"
        data-type="number"
        class="mt-3"
      ></firebot-input>

      <firebot-input
        ng-if="effect.event === 'notepress'"
        input-title="Note Duration"
        placeholder-text="Enter note duration in seconds (decimals allowed)"
        model="effect.noteDuration"
        data-type="number"
        class="mt-3"
      ></firebot-input>

      <firebot-input
        ng-if="effect.event === 'pitch'"
        input-title="Pitch"
        placeholder-text="Enter pitch value (0-16384)"
        model="effect.pitch"
        data-type="number"
        class="mt-3"
      ></firebot-input>

      <firebot-input
        ng-if="effect.event === 'cc'"
        input-title="Controller"
        placeholder-text="Enter controller number (0-127)"
        model="effect.ccController"
        data-type="number"
        class="mt-3"
      ></firebot-input>

      <firebot-input
        ng-if="effect.event === 'cc'"
        input-title="Control Value"
        placeholder-text="Enter control value (0-127)"
        model="effect.ccValue"
        data-type="number"
        class="mt-3"
      ></firebot-input>

      <firebot-input
        input-title="Channel (optional)"
        placeholder-text="Enter channel number (0-15), defaults to 0"
        model="effect.channel"
        data-type="number"
        class="mt-3"
      ></firebot-input>
    </eos-container>
  `,
    optionsController: ($scope, backendCommunicator: any) => {
      $scope.events = [
        {
          id: "noteon",
          name: "Note On",
          description: "Send a note on event",
        },
        {
          id: "noteoff",
          name: "Note Off",
          description: "Send a note off event",
        },
        {
          id: "notepress",
          name: "Note Press",
          description: "Send a note press event (combined note on and off)",
        },
        {
          id: "cc",
          name: "Control Change",
          description: "Send a control change event",
        },
        {
          id: "pitch",
          name: "Pitch",
          description: "Send a pitch event",
        },
      ];

      $scope.outputs = [];

      backendCommunicator
        .fireEventAsync("ebiggz-midi-output-names")
        .then((outputs: string[]) => {
          $scope.outputs = outputs?.map((n) => ({
            id: n,
            name: n,
          }));
        });
    },
    optionsValidator: (effect) => {
      if (effect.outputName == null) {
        return ["Please select a MIDI output"];
      }
      if (effect.event?.length < 1) {
        return ["Please select a MIDI event"];
      }
      if (
        effect.event === "notepress" ||
        effect.event === "noteon" ||
        effect.event === "noteoff"
      ) {
        if (effect.note == null) {
          return ["Please enter a note number"];
        }
        if (effect.velocity == null) {
          return ["Please enter a velocity value"];
        }
      }
      if (effect.event === "notepress") {
        if (effect.noteDuration == null) {
          return ["Please enter a note duration"];
        }
      }
      if (effect.event === "pitch") {
        if (effect.pitch == null) {
          return ["Please enter a pitch value"];
        }
      }
      if (effect.event === "cc") {
        if (effect.ccController == null) {
          return ["Please enter a controller number"];
        }
        if (effect.ccValue == null) {
          return ["Please enter a control value"];
        }
      }
      return [];
    },
    onTriggerEvent: async ({ effect }) => {
      const [valid, errorMessage] = validateMidiOutputEventData(effect);
      if (!valid) {
        logger.debug(
          `Invalid send MIDI output effect data. Reason: ${errorMessage}`,
          effect
        );
        return {
          success: false,
        };
      }

      try {
        if (effect.event === "notepress") {
          await sendMidiEventToOutput(
            effect.outputName,
            MidiOutputEvent.NoteOn,
            {
              note: effect.note!,
              velocity: effect.velocity!,
              channel: (effect.channel as Channel) ?? 0,
            }
          );
          await new Promise((resolve) =>
            setTimeout(resolve, (effect.noteDuration ?? 1.0) * 1000)
          );
          await sendMidiEventToOutput(
            effect.outputName,
            MidiOutputEvent.NoteOff,
            {
              note: effect.note!,
              velocity: effect.velocity!,
              channel: (effect.channel as Channel) ?? 0,
            }
          );
        } else if (
          effect.event === MidiOutputEvent.NoteOn ||
          effect.event === MidiOutputEvent.NoteOff
        ) {
          await sendMidiEventToOutput(effect.outputName, effect.event, {
            note: effect.note!,
            velocity: effect.velocity!,
            channel: (effect.channel as Channel) ?? 0,
          });
        } else if (effect.event === MidiOutputEvent.Pitch) {
          await sendMidiEventToOutput(
            effect.outputName,
            MidiOutputEvent.Pitch,
            {
              value: effect.pitch!,
              channel: (effect.channel as Channel) ?? 0,
            }
          );
        } else if (effect.event === MidiOutputEvent.ControlChange) {
          await sendMidiEventToOutput(
            effect.outputName,
            MidiOutputEvent.ControlChange,
            {
              controller: effect.ccController!,
              value: effect.ccValue!,
              channel: (effect.channel as Channel) ?? 0,
            }
          );
        }
        return {
          success: true,
        };
      } catch (error) {
        logger.error("Error sending MIDI output event", error);
        return {
          success: false,
        };
      }
    },
  };

/**
 * Validates the expected data per event type and also validates the data is valid
 * (e.g. note number is between 0 and 127, velocity is between 0 and 127, etc.)
 */
function validateMidiOutputEventData(
  data: MidiOutputEventData
): [success: boolean, errorMessage?: string] {
  if (data.outputName == null) {
    return [false, "MIDI output name is required"];
  }
  if (
    data.event === "notepress" ||
    data.event === "noteon" ||
    data.event === "noteoff"
  ) {
    if (data.note == null || data.velocity == null) {
      return [false, "Note and velocity are required"];
    }
    if (
      data.note < 0 ||
      data.note > 127 ||
      data.velocity < 0 ||
      data.velocity > 127
    ) {
      return [false, "Note and velocity must be between 0 and 127"];
    }
  }
  if (
    data.event === "notepress" &&
    (data.noteDuration == null || data.noteDuration < 0)
  ) {
    return [false, "Note duration must be a positive number"];
  }
  if (
    data.event === "pitch" &&
    (data.pitch == null || data.pitch < 0 || data.pitch > 16384)
  ) {
    return [false, "Pitch must be between 0 and 16384"];
  }
  if (data.event === "cc") {
    if (data.ccController == null || data.ccValue == null) {
      return [false, "Controller and control value are required"];
    }
    if (
      data.ccController < 0 ||
      data.ccController > 127 ||
      data.ccValue < 0 ||
      data.ccValue > 127
    ) {
      return [false, "Controller and control value must be between 0 and 127"];
    }
  }
  // Channel is optional, but if it's provided, it must be between 0 and 15
  if (data.channel != null && (data.channel < 0 || data.channel > 15)) {
    return [false, "Channel must be between 0 and 15"];
  }

  // convert values to integers
  data.note = data.note != null ? parseInt(data.note as any) : undefined;
  data.velocity =
    data.velocity != null ? parseInt(data.velocity as any) : undefined;
  data.noteDuration =
    data.noteDuration != null
      ? parseFloat(data.noteDuration as any)
      : undefined;
  data.pitch = data.pitch != null ? parseInt(data.pitch as any) : undefined;
  data.channel =
    data.channel != null ? parseInt(data.channel as any) : undefined;
  data.ccController =
    data.ccController != null ? parseInt(data.ccController as any) : undefined;
  data.ccValue =
    data.ccValue != null ? parseInt(data.ccValue as any) : undefined;

  return [true];
}
