import type { ZodiacDegree } from "./_types";

import { ZodiacList } from "./_consts";

export const fnDegToZodiacDegree = (degree: number): ZodiacDegree => {
  const zodiacIndex = Math.floor(degree / 30) % 12;
  const z = ZodiacList[zodiacIndex]!;
  const degreeInSign = degree % 30;
  const degreePart = Math.floor(degreeInSign);
  const minutePart = Math.floor((degreeInSign - degreePart) * 60);
  const secondPart = Math.round(
    ((degreeInSign - degreePart) * 60 - minutePart) * 60,
  );

  return {
    z,
    d: degreePart,
    m: minutePart,
    s: secondPart,
  } satisfies ZodiacDegree;
};