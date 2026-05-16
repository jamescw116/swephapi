// api/index.ts
import express, { Request, Response } from "express";
// sweph 冇提供官方 @types，所以我們用 require 或者直接 import 佢當作 any
//import sweph from "sweph";
import sweph from "sweph";

const app = express();

// 設定計算 Flag
const FLAG: number = sweph.constants.SEFLG_SWIEPH | sweph.constants.SEFLG_SPEED;

const HouseSystems = [
  "P", // Placidus
  "K", // Koch
  "O", // Porphyry
  "R", // Regiomontanus
  "C", // Campanus
  "A", // Equal
  "E", // Equal (Alternate)
  "W", // Whole Sign
] as const;
type HouseSystem = (typeof HouseSystems)[number];

interface Input {
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
}

const ZodiacSigns = [
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
type ZodiacSign = (typeof ZodiacSigns)[number];

interface Position {
  z: ZodiacSign;
  d: number; // 0 ~ 30
  m: number; // 0 ~ 59
  s: number; // 0 ~ 59
}

const PlanetMontions = [
  "Direct", // 順行
  "Stationary", // 駐留
  "Retrograde", // 逆行
] as const;
type PlanetMontion = (typeof PlanetMontions)[number];

// 定義回傳資料嘅 Interface (強型別的好處)
interface Planet {
  pos: number | Position;
  //lat: number;
  montion: number | PlanetMontion; // 1: 順行, 0: 駐留, -1: 逆行
}

interface ApiResponse {
  input: string | Input;
  julianDay: number;
  planets: { [key: string]: Planet };
  houses?: (number | Position)[];
}

const signFromDegree = (degree: number): Position => {
  const zodiacIndex = Math.floor(degree / 30) % 12;
  const z = ZodiacSigns[zodiacIndex]!;
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
  };
};

const inputToStr = (input: Input): string => {
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

// Test URL: http://localhost:3000/api/planets?y=1985&m=11&d=6&h=17&i=54&s=0&tz=8&lngD=114&lngM=6&latD=22&latM=12&hse=P&fmt=sign
// Prod URL: https://swephapi.vercel.app/api/planets?y=1985&m=11&d=6&h=17&i=54&s=0&tz=8&lngD=114&lngM=6&latD=22&latM=12&hse=P&fmt=sign
app.get("/api/planets", (req: Request, res: Response) => {
  try {
    const input: Input = {
      y: parseInt(req.query.y as string),
      m: parseInt(req.query.m as string),
      d: parseInt(req.query.d as string),
      h: parseInt((req.query.h as string) || "12"),
      i: parseInt((req.query.i as string) || "0"),
      s: parseInt((req.query.s as string) || "0"),
      tz: parseFloat((req.query.tz as string) || "0"),
      lngD: parseInt((req.query.lngD as string) || "0"),
      lngM: parseInt((req.query.lngM as string) || "0"),
      latD: parseInt((req.query.latD as string) || "0"),
      latM: parseInt((req.query.latM as string) || "0"),
      hse: (req.query.hse as HouseSystem) || "P", // 預設宮位系統為 Placidus
      fmt: (req.query.fmt as "raw" | "sign") || "raw", // 預設格式為 raw
    };

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
      return res.status(400).json({ error: "Invalid date parameters" });
    }

    if (input.m < 1 || input.m > 12) {
      return res.status(400).json({ error: "Month must be between 1 and 12" });
    }

    if (input.d < 1 || input.d > 31) {
      return res.status(400).json({ error: "Day must be between 1 and 31" });
    }

    if (new Date(input.y, input.m - 1, input.d).getDate() !== input.d) {
      return res.status(400).json({ error: "Invalid date" });
    }

    if (input.h < 0 || input.h > 23) {
      return res.status(400).json({ error: "Hour must be between 0 and 23" });
    }

    if (input.i < 0 || input.i > 59) {
      return res.status(400).json({ error: "Minute must be between 0 and 59" });
    }

    if (input.s < 0 || input.s > 59) {
      return res.status(400).json({ error: "Second must be between 0 and 59" });
    }

    if (input.tz < -12 || input.tz > 14) {
      return res
        .status(400)
        .json({ error: "Timezone must be between -12 and +14" });
    }

    if (input.lngD < -180 || input.lngD > 180) {
      return res
        .status(400)
        .json({ error: "Longitude degrees must be between -180 and 180" });
    }

    if (input.lngM < 0 || input.lngM > 59) {
      return res
        .status(400)
        .json({ error: "Longitude minutes must be between 0 and 59" });
    }

    if (input.latD < -90 || input.latD > 90) {
      return res
        .status(400)
        .json({ error: "Latitude degrees must be between -90 and 90" });
    }

    if (input.latM < 0 || input.latM > 59) {
      return res
        .status(400)
        .json({ error: "Latitude minutes must be between 0 and 59" });
    }

    if (!HouseSystems.includes(input.hse as any)) {
      return res.status(400).json({
        error: `Invalid house system, allowed values are: ${HouseSystems.join(", ")}`,
      });
    }

    // 1. 計算 Julian Day
    const jd: number = sweph.julday(
      //.swe_julday(
      input.y,
      input.m,
      input.d,
      input.h +
        -input.tz +
        parseFloat(input.i.toString()) / 60.0 +
        parseFloat(input.s.toString()) / 3600.0,
      sweph.constants.SE_GREG_CAL,
    );

    // 2. 定義星體
    const bodies: { [key: string]: number } = {
      sun: sweph.constants.SE_SUN,
      moon: sweph.constants.SE_MOON,
      mars: sweph.constants.SE_MARS,
      mercury: sweph.constants.SE_MERCURY,
      venus: sweph.constants.SE_VENUS,
      jupiter: sweph.constants.SE_JUPITER,
      saturn: sweph.constants.SE_SATURN,
      uranus: sweph.constants.SE_URANUS,
      neptune: sweph.constants.SE_NEPTUNE,
      pluto: sweph.constants.SE_PLUTO,
    };

    const results: { [key: string]: Planet } = {};

    // 3. 循環計算位置
    for (const [name, id] of Object.entries(bodies)) {
      const pos = sweph.calc_ut(jd, id, FLAG);
      results[name] = {
        pos: input.fmt === "raw" ? pos.data[0] : signFromDegree(pos.data[0]), // longitude
        //pos.data[1], // latitude
        //pos.data[2] // distance,
        montion: pos.data[3] > 0 ? 1 : pos.data[3] < 0 ? -1 : 0, // motion
      };
    }

    const responseData: ApiResponse = {
      input: input.fmt === "raw" ? input : inputToStr(input),
      julianDay: jd,
      planets: results,
      houses: sweph
        .houses(
          jd,
          input.latD + input.latM / 60.0,
          input.lngD + input.lngM / 60.0,
          input.hse,
        )
        .data.houses.map((h: number) =>
          input.fmt === "raw" ? h : signFromDegree(h),
        ),
    };

    res.json(responseData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV !== "production") {
  if (require.main === module) {
    app.listen(3000, () =>
      console.log("TS Server running on http://localhost:3000"),
    );
  }
}

export default app;
