import express, { Request, Response } from "express";
import cors from "cors";

import { fnPlanets } from "../lib/fnPlanets";

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

// Test URL: http://localhost:3000/api/planets?y=1985&m=11&d=6&h=17&i=54&s=0&tz=8&lngD=114&lngM=6&latD=22&latM=12&hse=P&fmt=sign
// Prod URL: https://swephapi.vercel.app/api/planets?y=1985&m=11&d=6&h=17&i=54&s=0&tz=8&lngD=114&lngM=6&latD=22&latM=12&hse=P&fmt=sign
app.get("/api/planets", (req: Request, res: Response) => {
  fnPlanets(req, res);
});

if (process.env.NODE_ENV !== "production") {
  if (require.main === module) {
    app.listen(3000, () =>
      console.log("TS Server running on http://localhost:3000"),
    );
  }
}

export default app;
