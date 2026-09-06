/**
 * 減脂記錄 App - 拍照辨識代理
 *
 * 部署步驟請看 README.md。
 * 使用前，請先在「專案設定 → 指令碼屬性」新增一筆：
 *   鍵：ANTHROPIC_API_KEY
 *   值：你的 Anthropic API key
 */

var MODEL = "claude-sonnet-5"; // 想省成本可改成 "claude-haiku-4-5-20251001"

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var imageBase64 = body.image;
    var mimeType = body.mimeType || "image/jpeg";

    if (!imageBase64) {
      return jsonOutput({ error: "缺少圖片資料" });
    }

    var apiKey = PropertiesService.getScriptProperties().getProperty("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return jsonOutput({ error: "尚未設定 ANTHROPIC_API_KEY，請見 README" });
    }

    var promptText =
      "你是營養估算助手。請看這張食物照片，用繁體中文估算以下資訊，" +
      "並「只」回傳一個 JSON 物件，不要有任何其他文字、不要用 markdown code block：\n" +
      "{\n" +
      '  "food_name": "食物名稱（簡短）",\n' +
      '  "calories": 估計總熱量的數字（kcal，整數）,\n' +
      '  "sugar_g": 估計含糖量的數字（公克，可以有小數）,\n' +
      '  "note": "一句話備註，例如份量估計或含糖飲料提醒（可留空字串）"\n' +
      "}\n" +
      "如果照片中看起來不是食物或飲料，food_name 請填「無法辨識」，calories 與 sugar_g 填 0。";

    var payload = {
      model: MODEL,
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: imageBase64
              }
            },
            { type: "text", text: promptText }
          ]
        }
      ]
    };

    var response = UrlFetchApp.fetch("https://api.anthropic.com/v1/messages", {
      method: "post",
      contentType: "application/json",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    var status = response.getResponseCode();
    var responseData = JSON.parse(response.getContentText());

    if (status !== 200) {
      var apiErr = (responseData.error && responseData.error.message) || "Anthropic API 錯誤";
      return jsonOutput({ error: apiErr });
    }

    var textBlock = "";
    (responseData.content || []).forEach(function (block) {
      if (block.type === "text") textBlock += block.text;
    });

    var cleaned = textBlock.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();

    var parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      return jsonOutput({ error: "無法解析辨識結果，請重拍一次" });
    }

    return jsonOutput(parsed);
  } catch (err) {
    return jsonOutput({ error: String(err) });
  }
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
