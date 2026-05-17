import sweph from "sweph";

export const ZodiacList = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;
export type ZodiacName = (typeof ZodiacList)[number];

export const PlanetList = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",

  "ceres", // 穀神星
  "pallas", // 智神星
  "juno", // 婚神星
  "vesta", // 灶神星
  "chiron", // 凱龍星

  "northNode", // 北交點
  "lilith", // 黑月莉莉絲
] as const;
export type PlanetName = (typeof PlanetList)[number];

export const PlanetIDs: { [key in PlanetName]: number } = {
  sun: sweph.constants.SE_SUN,
  moon: sweph.constants.SE_MOON,
  mercury: sweph.constants.SE_MERCURY,
  venus: sweph.constants.SE_VENUS,
  mars: sweph.constants.SE_MARS,
  jupiter: sweph.constants.SE_JUPITER,
  saturn: sweph.constants.SE_SATURN,
  uranus: sweph.constants.SE_URANUS,
  neptune: sweph.constants.SE_NEPTUNE,
  pluto: sweph.constants.SE_PLUTO,

  ceres: sweph.constants.SE_CERES, // 穀神星
  pallas: sweph.constants.SE_PALLAS, // 智神星
  juno: sweph.constants.SE_JUNO, // 婚神星
  vesta: sweph.constants.SE_VESTA, // 灶神星
  chiron: sweph.constants.SE_CHIRON, // 凱龍星

  northNode: sweph.constants.SE_TRUE_NODE, // 北交點
  lilith: sweph.constants.SE_MEAN_APOG, // 黑月莉莉絲（平均交點）
};

export const FixStarList = [
  "Regulus", // 軒轅十四
  "Aldebaran", // 畢宿五
  "Antares", // 心宿二
  "Fomalhaut", // 北落師門 / 南魚座α
  "Algol", // 大陵五

  "Sirius", // 天狼星
  "Arcturus", // 大角星
  "Vega", // 織女星
] as const;
export type FixStarName = (typeof FixStarList)[number];

export const HouseSystemList = [
  "P", // Placidus
  "K", // Koch
  "O", // Porphyry
  "R", // Regiomontanus
  "C", // Campanus
  "A", // Equal
  "E", // Equal (Alternate)
  "W", // Whole Sign
] as const;
export type HouseSystem = (typeof HouseSystemList)[number];

export const PlanetMotionList = [
  "Direct", // 順行
  "Stationary", // 駐留
  "Retrograde", // 逆行
] as const;
export type PlanetMotion = (typeof PlanetMotionList)[number];

export const ErrorUsage = {
  method: "GET",
  path: "/api/planets",
  required: [
    "y (年, int)",
    "m (月, int)",
    "d (日, int)",
    "h (小時, int)",
    "i (分鐘, int)",
    "s (秒, int)",
    "tz (時區, float, -12 ~ +14, 例如香港+8)",
    "lngD (經度度, int, -180 ~ +180, 東經為正E+, 西經為負W-)",
    "lngM (經度分, int, 0 ~ 59)",
    "latD (緯度度, int, -90 ~ +90, 北緯為正N+, 南緯為負S-)",
    "latM (緯度分, int, 0 ~ 59)",
    "hse (宮位系統, str, 可選: P(Placidus), K(Koch), O(Porphyry), R(Regiomontanus), C(Campanus), A(Equal), E(Equal Alt), W(Whole Sign))",
  ],
  optional: ["fmt (回傳格式, raw 或 sign, 預設 raw)"],
  example:
    "https://swephapi.vercel.app/api/planets?y=1985&m=11&d=6&h=17&i=54&s=0&tz=8&lngD=114&lngM=6&latD=22&latM=12&hse=P&fmt=sign",
};
