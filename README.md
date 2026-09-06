# 減脂記錄 — 部署說明

這個版本先做好「拍照記錄飲食」這個功能，體重/體脂趨勢頁之後再補上。

## 檔案說明

- `index.html` — App 本體（介面 + 邏輯），可以直接用瀏覽器開啟測試
- `manifest.json` / `sw.js` / `icon-192.png` / `icon-512.png` — 讓手機可以把它「加到主畫面」變成 PWA
- `apps-script/Code.gs` — 部署到 Google Apps Script 的後端，負責呼叫 Anthropic API 做拍照辨識

前端不會直接放 API key（放在網頁裡不安全），所以拍照辨識要透過 Apps Script 當代理。

## 步驟一：部署 Apps Script 代理

1. 到 https://script.google.com/ 建立一個新專案
2. 把 `apps-script/Code.gs` 的內容整個貼進去，取代預設的 `Code.gs`
3. 左側「專案設定」→「指令碼屬性」→ 新增屬性：
   - 鍵：`ANTHROPIC_API_KEY`
   - 值：你的 Anthropic API key
4. 右上角「部署」→「新增部署作業」
   - 類型選「網頁應用程式」
   - 執行身分：我
   - 誰能存取：任何人
5. 部署後會拿到一個網址，長得像：
   `https://script.google.com/macros/s/AKfycb.../exec`
   這個網址等一下要貼到 App 的「設定」頁裡

## 步驟二：部署到 GitHub Pages

1. 建一個新的 GitHub repo（例如 `fat-loss-app`）
2. 把這個資料夾裡除了 `apps-script/` 以外的檔案（`index.html`、`manifest.json`、`sw.js`、兩個 icon）都上傳到 repo 根目錄
3. Repo 設定 → Pages → Source 選 `main` 分支 / root，儲存
4. 幾分鐘後就可以用 GitHub 給的網址在手機瀏覽器打開

## 步驟三：手機上設定

1. 用手機瀏覽器打開部署好的網址
2. Safari／Chrome 選單裡選「加入主畫面」，之後就會有一個像 App 一樣的圖示
3. 打開 App，進「設定」頁，把步驟一拿到的 Apps Script 網址貼進「Apps Script Web App 網址」欄位，儲存
4. 回到「紀錄」頁，就可以開始拍照記錄了

## 目前功能

- 拍照 → 呼叫 AI 辨識食物名稱、估計熱量與含糖量 → 可手動修正後儲存
- 當天的飲食紀錄列表，含糖量高的項目會用紅色標示
- 今日糖分攝取總量 vs. 每日上限的進度條（預設 25 克，可在設定調整）
- 所有資料存在手機瀏覽器的 localStorage，只在這台手機上看得到，不會跨裝置同步

## 之後可以加的功能（下一階段）

- 體重／體脂輸入與趨勢折線圖（「趨勢」分頁目前是預留位置）
- 依日期回顧過去的飲食紀錄，而不是只看今天
- 每週糖分攝取的統計摘要
