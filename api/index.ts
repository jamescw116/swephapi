// api/index.ts
import express, { Request, Response } from "express";
// sweph 冇提供官方 @types，所以我們用 require 或者直接 import 佢當作 any
//import sweph from "sweph";
import sweph from "sweph";

const app = express();

// 設定計算 Flag
const FLAG: number = sweph.constants.SEFLG_SWIEPH | sweph.constants.SEFLG_SPEED;

// 定義回傳資料嘅 Interface (強型別的好處)
interface PlanetData {
  longitude: number;
  latitude: number;
  distance: number;
  speedLng: number;
  speedLat?: number; // 如果需要的話可以加上緯度速度
  speedDist?: number; // 如果需要的話可以加上距離速度
}

interface ApiResponse {
  date: string;
  julianDay: number;
  planets: { [key: string]: PlanetData };
}

app.get("/api/planets", (req: Request, res: Response) => {
  try {
    const year = parseInt(req.query.year as string);
    const month = parseInt(req.query.month as string);
    const day = parseInt(req.query.day as string);
    const hour = parseInt((req.query.hour as string) || "12");
    const minute = parseInt((req.query.minute as string) || "0");
    const second = parseInt((req.query.second as string) || "0");
    const tz = parseFloat((req.query.tz as string) || "0");

    if (!year || !month || !day) {
      return res.status(400).json({ error: "請提供 year, month, day 參數" });
    }

    // 1. 計算 Julian Day
    const jd: number = sweph.julday(   //.swe_julday(
      year,
      month,
      day,
      hour + tz + (parseFloat(minute.toString()) / 60.0) + (parseFloat(second.toString()) / 3600.0),
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
    };

    const results: { [key: string]: PlanetData } = {};

    // 3. 循環計算位置
    for (const [name, id] of Object.entries(bodies)) {
      const pos = sweph.calc_ut(jd, id, FLAG);
      results[name] = {
        longitude: pos.data[0], //.longitude,
        latitude: pos.data[1], //.latitude,
        distance: pos.data[2], //.distance,
        speedLng: pos.data[3], //.speedLng,
        speedLat: pos.data[4], //.speedLat,
        speedDist: pos.data[5], //.speedDist,
      };
    }

    const responseData: ApiResponse = {
      date: `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")} ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")} (UTC${tz >= 0 ? "+" : "-"}${tz.toFixed(1)})`,
      julianDay: jd,
      planets: results,
    };

    res.json(responseData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default app;

if (require.main === module) {
  app.listen(3000, () =>
    console.log("TS Server running on http://localhost:3000"),
  );
}
