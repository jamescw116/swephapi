import { Request, Response } from "express";
import sweph from "sweph";

import type { ApiErrorResponse, ApiResponse, Input, Planet, Planets, ZodiacDegree } from "./_types";
import type { ZodiacName } from "./_consts";

import { ErrorUsage, FixStarList, PlanetIDs } from "./_consts";

import { fnValidateInput } from "./fnValidateInput";
import { fnParseQuery } from "./fnParseQuery";
import { fnToFixDp } from "./fnToFixDp";
import { fnDegToZodiacDegree } from "./fnDegToZodiacDegree";
import { fnInputToStr } from "./fnInputToStr";

export const fnPlanets = (req: Request, res: Response<ApiResponse | ApiErrorResponse>) => {
  try {
    // 設定計算 Flag
    const FLAG: number = sweph.constants.SEFLG_SWIEPH | sweph.constants.SEFLG_SPEED;

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

    sweph.set_ephe_path(__dirname + "/../sweph");

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
      const result = sweph.calc_ut(jd, id, FLAG);
      const deg = fnToFixDp(result.data[0]);
      results[planet] = {
        d: input.fmt === "raw" ? deg : fnDegToZodiacDegree(deg), // longitude
        //deg.data[1], // latitude
        //deg.data[2] // distance,
        m: result.data[3] > 0 ? 1 : result.data[3] < 0 ? -1 : 0, // motion
      };
    }

    sweph.fixstar;

    const responseData: ApiResponse = {
      ...(input.fmt === "sign" ? { i: fnInputToStr(input) } : {}),
      p: results as Planets,
      h: sweph
        .houses(
          jd,
          input.latD + input.latM / 60.0,
          input.lngD + input.lngM / 60.0,
          input.hse,
        )
        .data.houses.map((h: number) => {
          const deg = fnToFixDp(h);
          return input.fmt === "raw" ? deg : fnDegToZodiacDegree(deg);
        }),
      fs: FixStarList.map((star: string) => {
        sweph.constants.SE_FIXSTAR;
        const result = sweph.fixstar2_ut(star, jd, FLAG);
        const deg = fnToFixDp(result.data[0]);
        return {
          [star]: input.fmt === "raw" ? deg : fnDegToZodiacDegree(deg),
        };
      }).reduce((acc, curr) => ({ ...acc, ...curr }), {}) as Record<
        ZodiacName,
        number | ZodiacDegree
      >,
    } satisfies ApiResponse;

    res.json(responseData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
