import { EventFilter } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-filter-manager";

type FilterConfig = {
  id: string;
  name: string;
  description: string;
  events: Array<{
    eventSourceId: string;
    eventId: string;
  }>;
  eventMetaKey: string;
  caseInsensitive?: boolean;
};

enum ComparisonType {
  IS = "is",
  IS_NOT = "is not",
  GREATER_THAN = "greater than",
  GREATER_THAN_OR_EQUAL_TO = "greater than or equal to",
  LESS_THAN = "less than",
  LESS_THAN_OR_EQUAL_TO = "less than or equal to",
}

export function createNumberFilter({
  eventMetaKey,
  caseInsensitive,
  ...config
}: FilterConfig): Omit<EventFilter, "presetValues" | "valueType"> & {
  valueType: "number";
} {
  return {
    ...config,
    comparisonTypes: [
      ComparisonType.IS,
      ComparisonType.IS_NOT,
      ComparisonType.LESS_THAN,
      ComparisonType.LESS_THAN_OR_EQUAL_TO,
      ComparisonType.GREATER_THAN,
      ComparisonType.GREATER_THAN_OR_EQUAL_TO,
    ],
    valueType: "number",
    async predicate(filterSettings, eventData) {
      const { comparisonType, value } = filterSettings;
      const { eventMeta } = eventData;

      const eventValue = eventMeta[eventMetaKey] ?? 0;

      switch (comparisonType) {
        case ComparisonType.IS: {
          return eventValue === value;
        }
        case ComparisonType.IS_NOT: {
          return eventValue !== value;
        }
        case ComparisonType.LESS_THAN: {
          return eventValue < value;
        }
        case ComparisonType.LESS_THAN_OR_EQUAL_TO: {
          return eventValue <= value;
        }
        case ComparisonType.GREATER_THAN: {
          return eventValue > value;
        }
        case ComparisonType.GREATER_THAN_OR_EQUAL_TO: {
          return eventValue >= value;
        }
        default:
          return false;
      }
    },
  };
}
