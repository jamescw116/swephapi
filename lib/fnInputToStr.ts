import type { Input } from "./_types";

export const fnInputToStr = (input: Input): string => {
  const s: string[] = [
    input.y.toString().padStart(4, "0"),
    "-",
    input.m.toString().padStart(2, "0"),
    "-",
    input.d.toString().padStart(2, "0"),
    " ",
    input.h.toString().padStart(2, "0"),
    ":",
    input.i.toString().padStart(2, "0"),
    ":",
    input.s.toString().padStart(2, "0"),
    " ",
    `(UTC${input.tz >= 0 ? "+" : "-"}${input.tz.toFixed(1)})`,
    " ",
    input.lngD.toString().padStart(3, "0"),
    "°",
    input.lngD > 0 ? "E" : "W",
    input.lngM.toString().padStart(2, "0"),
    "'",
    " ",
    input.latD.toString().padStart(2, "0"),
    "°",
    input.latD > 0 ? "N" : "S",
    input.latM.toString().padStart(2, "0"),
    "'",
    " ",
    `House System: ${input.hse}`,
  ];

  return s.join("");
};