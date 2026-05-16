import { Request } from "express";
import type { HouseSystem } from "./_consts";
import type { Input } from "./_types";

export const fnParseQuery = (req: Request): Input => ({
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
} satisfies Input);
