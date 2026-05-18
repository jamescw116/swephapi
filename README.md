# swephapi

swephapi 係一個基於 [sweph npm 套件](https://www.npmjs.com/package/sweph)（底層用 Swiss Ephemeris）嘅 Node.js REST API 伺服器，可以計算行星位置、星座、宮位等。

## 功能簡介
- 提供 `/api/planets` API，根據輸入日期、時間、地點，計算太陽、月亮、八大行星嘅位置及宮位。
- 支援多種宮位系統（Placidus、Koch、Porphyry 等）。
- 回傳格式可選「原始度數」或「星座分度」。

## 安裝方法
```bash
git clone <本專案網址>
cd swephapi
npm install
```

## 啟動伺服器
```bash
npx ts-node api/index.ts
# 或
npm run dev
```
預設會喺 http://localhost:3000 提供服務。

## API 說明

### 路徑
`GET /api/planets`

### 輸入參數
| 參數   | 說明         | 類型 | 範例 | 必填 | 備註 |
|--------|--------------|------|------|------|------|
| y      | 年           | int  | 1985 | ✔️   |      |
| m      | 月           | int  | 11   | ✔️   | 1~12 |
| d      | 日           | int  | 6    | ✔️   | 1~31 |
| h      | 小時         | int  | 17   | ✔️   | 0~23 |
| i      | 分鐘         | int  | 54   | ✔️   | 0~59 |
| s      | 秒           | int  | 0    | ✔️   | 0~59 |
| tz     | 時區         | float| 8    | ✔️   | 香港+8，倫敦0 |
| lngD   | 經度度數       | int  | 114  | ✔️   | -180~180，東+西- |
| lngM   | 經度分數       | int  | 0    | ✔️   | 0~59 |
| latD   | 緯度度數       | int  | 22   | ✔️   | -90~90，北+南- |
| latM   | 緯度分數       | int  | 0    | ✔️   | 0~59 |
| hse    | 宮位系統       | char | P    | ✔️   | P: Placidus, K: Koch 等 |
| fmt    | 返回格式       | char | raw  |    | raw: 原始度數, sign: 星座分度 |

### 返回格式

#### 成功響應
```json
{
  "i": "1985-11-06 17:54:00 +8", // 可選，當 fmt 為 sign 時返回
  "p": {
    "Sun": { "d": { "z": "Scorpio", "d": 14, "m": 23, "s": 45 }, "m": 1 },
    "Moon": { "d": { "z": "Taurus", "d": 27, "m": 12, "s": 30 }, "m": -1 }
  },
  "h": [
    { "z": "Aries", "d": 0, "m": 0, "s": 0 },
    { "z": "Taurus", "d": 30, "m": 0, "s": 0 }
  ],
  "fs": {
    "Aldebaran": { "z": "Taurus", "d": 9, "m": 47, "s": 0 }
  }
}
```

#### 錯誤響應
```json
{
  "error": "請提供必要參數，以下為 API 使用說明：",
  "usage": "...ErrorUsage 的內容..."
}
```

### 範例
#### 本地測試
```
GET http://localhost:3000/api/planets?y=1985&m=11&d=6&h=17&i=54&s=0&tz=8&lngD=114&lngM=6&latD=22&latM=12&hse=P&fmt=sign
```

#### Production 線上服務
```
GET https://swephapi.vercel.app/api/planets?y=1985&m=11&d=6&h=17&i=54&s=0&tz=8&lngD=114&lngM=6&latD=22&latM=12&hse=P&fmt=sign
```

## 參考
- [Swiss Ephemeris 官方網站](https://www.astro.com/swisseph/)
- [sweph npm 套件](https://www.npmjs.com/package/sweph)
