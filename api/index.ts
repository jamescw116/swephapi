import express, { Request, Response } from "express";
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
        deg:
          input.fmt === "raw" ? deg.data[0] : fnDegToZodiacDegree(deg.data[0]), // longitude
        //deg.data[1], // latitude
        //deg.data[2] // distance,
        motion: deg.data[3] > 0 ? 1 : deg.data[3] < 0 ? -1 : 0, // motion
      };
    }

    const responseData: ApiResponse = {
      input: input.fmt === "raw" ? input : fnInputToStr(input),
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
