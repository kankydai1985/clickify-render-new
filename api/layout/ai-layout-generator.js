// layout/ai-layout-generator.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateLayout({ text, image_url, logo_url, brand_color, business_name }) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // ПРОМПТ — ТОЛЬКО ТЕКСТ. НИКАКИХ URL!
  const prompt = `
Создай HTML-баннер 1080x1080 для Instagram.

Требования:
- Только <div>, <h1>, <p> для текста
- Текст: "${text.replace(/\n/g, ' ')}"
- Название: "${business_name}"
- Цвет бренда: ${brand_color || '#FF6600'}

Стиль: большой жирный заголовок, тень, градиент, современно.
Верни ТОЛЬКО <div id="content"> с inline CSS. Никаких <img>, url(), background-image.
`.trim();

  try {
    const result = await model.generateContent(prompt);
    let content = (await result.response).text();
    content = content.replace(/```html/g, '').replace(/```/g, '').trim();

    // ВСЁ ОСТАЛЬНОЕ — ВРУЧНУЮ
    return `
      <div id="banner" style="
        width:1080px;height:1080px;position:relative;overflow:hidden;
        background-image:url('${image_url}');background-size:cover;background-position:center;
        font-family:system-ui,sans-serif;color:white;text-align:center;
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        padding:80px;box-sizing:border-box;
      ">
        <!-- ЛОГОТИП -->
        <img src="${logo_url}" style="
          position:absolute;top:30px;left:30px;width:140px;height:140px;
          object-fit:contain;background:white;border-radius:16px;padding:8px;
          border:3px solid white;box-shadow:0 6px 20px rgba(0,0,0,0.6);z-index:10;
        " alt="Logo">

        <!-- ТЕКСТ ОТ GEMINI -->
        <div style="max-width:85%;text-shadow:0 4px 16px rgba(0,0,0,0.8);">
          ${content}
        </div>
      </div>
    `.trim();

  } catch (err) {
    console.error('Gemini error:', err);
    // ЗАПАСНОЙ
    return `
      <div id="banner" style="
        width:1080px;height:1080px;position:relative;overflow:hidden;
        background-image:url('${image_url}');background-size:cover;background-position:center;
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        padding:80px;font-family:system-ui,sans-serif;color:white;text-align:center;
      ">
        <img src="${logo_url}" style="
          position:absolute;top:30px;left:30px;width:140px;height:140px;
          object-fit:contain;background:white;border-radius:16px;padding:8px;
          box-shadow:0 6px 20px rgba(0,0,0,0.6);z-index:10;
        ">
        <h1 style="font-size:72px;margin:0;line-height:1.1;text-shadow:0 4px 16px rgba(0,0,0,0.8);">
          ${business_name}
        </h1>
        <p style="font-size:48px;margin:20px 0;text-shadow:0 4px 16px rgba(0,0,0,0.8);">
          ${text.replace(/\n/g, '<br>')}
        </p>
      </div>
    `.trim();
  }
}
