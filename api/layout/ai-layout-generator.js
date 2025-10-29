// layout/ai-layout-generator.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateLayout({ text, image_url, logo_url, brand_color, business_name }) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
Ты — дизайнер Instagram-баннеров. Создай ТОЛЬКО ТЕКСТОВЫЙ КОНТЕНТ для баннера 1080x1080.

ОБЯЗАТЕЛЬНО ИСПОЛЬЗУЙ:
- Цвет текста: ${brand_color || '#FF6600'}
- Название: "${business_name}"
- Акция: "${text.split('\n')[0]}"

СТРУКТУРА (ВЕРНИ ТОЛЬКО ЭТО):
<div id="content" style="text-align:center;color:${brand_color};text-shadow:0 4px 12px rgba(0,0,0,0.7);">
  <h1 style="font-size:78px;margin:0;line-height:1.1;font-weight:900;">${business_name}</h1>
  <p style="font-size:54px;margin:16px 0;font-weight:700;">${text.split('\n')[0]}</p>
  <p style="font-size:36px;margin:8px 0;">${text.split('\n')[1] || ''}</p>
  <p style="font-size:28px;color:#fff;margin-top:24px;">${text.split('#')[1]?.trim() || ''}</p>
</div>

ПРАВИЛА:
- НИКАКИХ <img>, background, url()
- НИКАКИХ \`\`\`html
- ТОЛЬКО HTML выше
`.trim();

  try {
    const result = await model.generateContent(prompt);
    let content = (await result.response).text();
    content = content.replace(/```html/g, '').replace(/```/g, '').trim();

    // ЕСЛИ НЕ СООТВЕТСТВУЕТ — ЗАПАСНОЙ
    if (!content.includes('<h1') || !content.includes(brand_color)) {
      content = `
        <div id="content" style="text-align:center;color:${brand_color};text-shadow:0 4px 12px rgba(0,0,0,0.7);">
          <h1 style="font-size:78px;margin:0;line-height:1.1;font-weight:900;">${business_name}</h1>
          <p style="font-size:54px;margin:16px 0;font-weight:700;">${text.split('\n')[0]}</p>
          <p style="font-size:36px;margin:8px 0;">${text.split('\n')[1] || ''}</p>
          <p style="font-size:28px;color:#fff;margin-top:24px;">${text.split('#')[1]?.trim() || ''}</p>
        </div>
      `.trim();
    }

    return `
      <div id="banner" style="
        width:1080px;height:1080px;position:relative;overflow:hidden;
        background-image:url('${image_url}');background-size:cover;background-position:center;
        font-family:'Helvetica Neue',sans-serif;display:flex;align-items:center;justify-content:center;
      ">
        <!-- ЛОГОТИП -->
        <img src="${logo_url}" style="
          position:absolute;top:30px;left:30px;width:140px;height:140px;
          object-fit:contain;background:white;border-radius:16px;padding:8px;
          border:3px solid white;box-shadow:0 6px 20px rgba(0,0,0,0.6);z-index:10;
        " alt="Logo">

        <!-- ТЕКСТ ОТ GEMINI -->
        <div style="max-width:85%;">
          ${content}
        </div>
      </div>
    `.trim();

  } catch (err) {
    console.error('Gemini error:', err);
    return `
      <div id="banner" style="
        width:1080px;height:1080px;position:relative;overflow:hidden;
        background-image:url('${image_url}');background-size:cover;background-position:center;
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        padding:80px;font-family:sans-serif;color:${brand_color};text-align:center;
      ">
        <img src="${logo_url}" style="
          position:absolute;top:30px;left:30px;width:140px;height:140px;
          object-fit:contain;background:white;border-radius:16px;padding:8px;
          box-shadow:0 6px 20px rgba(0,0,0,0.6);z-index:10;
        ">
        <h1 style="font-size:78px;margin:0;line-height:1.1;font-weight:900;text-shadow:0 4px 12px rgba(0,0,0,0.7);">
          ${business_name}
        </h1>
        <p style="font-size:54px;margin:20px 0;font-weight:700;text-shadow:0 4px 12px rgba(0,0,0,0.7);">
          ${text.split('\n')[0]}
        </p>
      </div>
    `.trim();
  }
}
