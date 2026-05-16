import { HouseSystemList } from "./_consts";
import type { ApiErrorResponse, Input } from "./_types";

export const fnValidateInput = (input: Input): ApiErrorResponse | undefined => {
  let response: ApiErrorResponse | undefined = undefined;

  if (
    isNaN(input.y) ||
    isNaN(input.m) ||
    isNaN(input.d) ||
    isNaN(input.h) ||
    isNaN(input.i) ||
    isNaN(input.s) ||
    isNaN(input.tz) ||
    isNaN(input.lngD) ||
    isNaN(input.lngM) ||
    isNaN(input.latD) ||
    isNaN(input.latM)
  ) {
    response = { error: "Invalid date parameters" };
  }

  if (input.m < 1 || input.m > 12) {
    response = { error: "Month must be between 1 and 12" };
  }

  if (input.d < 1 || input.d > 31) {
    response = { error: "Day must be between 1 and 31" };
  }

  if (new Date(input.y, input.m - 1, input.d).getDate() !== input.d) {
    response = { error: "Invalid date" };
  }

  if (input.h < 0 || input.h > 23) {
    response = { error: "Hour must be between 0 and 23" };
  }

  if (input.i < 0 || input.i > 59) {
    response = { error: "Minute must be between 0 and 59" };
  }

  if (input.s < 0 || input.s > 59) {
    response = { error: "Second must be between 0 and 59" };
  }

  if (input.tz < -12 || input.tz > 14) {
    response = { error: "Timezone must be between -12 and +14" };
  }

  if (input.lngD < -180 || input.lngD > 180) {
    response = { error: "Longitude degrees must be between -180 and 180" };
  }

  if (input.lngM < 0 || input.lngM > 59) {
    response = { error: "Longitude minutes must be between 0 and 59" };
  }

  if (input.latD < -90 || input.latD > 90) {
    response = { error: "Latitude degrees must be between -90 and 90" };
  }

  if (input.latM < 0 || input.latM > 59) {
    response = { error: "Latitude minutes must be between 0 and 59" };
  }

  if (!HouseSystemList.includes(input.hse as any)) {
    response = {
      error: `Invalid house system, allowed values are: ${HouseSystemList.join(", ")}`,
    };
  }

  return response;
};
