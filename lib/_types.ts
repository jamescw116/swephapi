import type {
  ErrorUsage,
  HouseSystem,
  PlanetMotion,
  PlanetName,
  ZodiacName,
} from "./_consts";

export type Input = {
  y: number;
  m: number;
  d: number;
  h: number;
  i: number;
  s: number;
  tz: number; // 時區，預設為 0 (UTC) // HK: +8, VAN: -7~8, TO: -4~5, LON: 0
  lngD: number; // 可選的地理經度度，預設為 0 // E: +, W: -, range: -180 ~ +180
  lngM: number; // 可選的地理經度分，預設為 0 // E: +, W: -, range: 0 ~ 59
  latD: number; // 可選的地理緯度度，預設為 0 // N: +, S: -, range: -90 ~ +90
  latM: number; // 可選的地理緯度分，預設為 0 // N: +, S: -, range: 0 ~ 59
  hse: HouseSystem; // P: Placidus, K: Koch, O: Porphyry, R: Regiomontanus, C: Campanus, A: Equal, E: Equal (Alternate), W: Whole Sign
  fmt: "raw" | "sign";
};

export type ZodiacDegree = {
  z: ZodiacName;
  d: number; // 0 ~ 30
  m: number; // 0 ~ 59
  s: number; // 0 ~ 59
};

export type Planet = {
  d: number | ZodiacDegree;
  m: number | PlanetMotion; // 1: 順行, 0: 駐留, -1: 逆行
};

export type Planets = Record<PlanetName, Planet>;

export type ApiResponse = {
  input?: string | Input | undefined;
  planets: Planets;
  houses: (number | ZodiacDegree)[];
  fixStars: Record<ZodiacName, number | ZodiacDegree>;
};

export type ApiErrorResponse = {
  error: string;
  usage?: typeof ErrorUsage;
};
