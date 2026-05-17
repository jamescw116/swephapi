import express, { Request, Response } from "express";
import cors from "cors";
import sweph from "sweph";

import type {
  ApiErrorResponse,
  ApiResponse,
  Input,
  Planet,
  Planets,
} from "../lib/_types";

import { ErrorUsage, PlanetIDs } from "../lib/_consts";

import { fnDegToZodiacDegree } from "../lib/fnDegToZodiacDegree";
import { fnInputToStr } from "../lib/fnInputToStr";
import { fnParseQuery } from "../lib/fnParseQuery";
import { fnValidateInput } from "../lib/fnValidateInput";

const app = express();

const originsEnv = process.env.ALLOWED_ORIGINS;
const allowedOrigins = originsEnv
  ? originsEnv.split(",")
  : ["http://localhost:3000"];

// 2. 設定 CORS 動態檢查
app.use(
  cors({
    origin: (origin, callback) => {
      // 如果沒有 origin (例如 Postman、或者是同網域請求)，直接放行
      if (!origin) return callback(null, true);

      // 檢查發送請求的網域（origin）是否在我們允許的清單內
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        allowedOrigins.includes("*")
      ) {
        callback(null, true); // 在清單內，放行！
      } else {
        callback(new Error("CORS Policy: 此網域不允許存取該 API。")); // 阻截！
      }
    },
  }),
);

app.get("/", (_req: Request, res: Response) => {
  res.redirect("/api/planets");
});

// 設定計算 Flag
const FLAG: number = sweph.constants.SEFLG_SWIEPH | sweph.constants.SEFLG_SPEED;

// Test URL: http://localhost:3000/api/planets?y=1985&m=11&d=6&h=17&i=54&s=0&tz=8&lngD=114&lngM=6&latD=22&latM=12&hse=P&fmt=sign
// Prod URL: https://swephapi.vercel.app/api/planets?y=1985&m=11&d=6&h=17&i=54&s=0&tz=8&lngD=114&lngM=6&latD=22&latM=12&hse=P&fmt=sign
app.get("/api/planets", (req: Request, res: Response) => {
  try {
    let error: ApiErrorResponse | undefined = undefined;

    // 檢查 query 是否有內容
    if (!req.query || Object.keys(req.query).length === 0) {
      error = {
        error: "請提供必要參數，以下為 API 使用說明：",
        usage: ErrorUsage,
      };
    }

    const input: Input = error ? ({} as Input) : fnParseQuery(req);

    error = error || fnValidateInput(input);

    if (error) {
      return res.status(400).json(error);
    }

    // 1. 計算 Julian Day
    const jd: number = sweph.julday(
      input.y,
      input.m,
      input.d,
      input.h +
        -input.tz +
        parseFloat(input.i.toString()) / 60.0 +
        parseFloat(input.s.toString()) / 3600.0,
      sweph.constants.SE_GREG_CAL,
    );

    const results: Record<string, Planet> = {};

    // 3. 循環計算位置
    for (const [planet, id] of Object.entries(PlanetIDs)) {
      const deg = sweph.calc_ut(jd, id, FLAG);
      results[planet] = {
        d: input.fmt === "raw" ? deg.data[0] : fnDegToZodiacDegree(deg.data[0]), // longitude
        //deg.data[1], // latitude
        //deg.data[2] // distance,
        m: deg.data[3] > 0 ? 1 : deg.data[3] < 0 ? -1 : 0, // motion
      };
    }

    const responseData: ApiResponse = {
      ...(input.fmt === "raw" ? { input: fnInputToStr(input) } : {}),
      planets: results as Planets,
      houses: sweph
        .houses(
          jd,
          input.latD + input.latM / 60.0,
          input.lngD + input.lngM / 60.0,
          input.hse,
        )
        .data.houses.map((h: number) =>
          input.fmt === "raw" ? h : fnDegToZodiacDegree(h),
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
