// api/layout/ai-layout-generator.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateLayout({
  text,
  image_url,
  logo_url,
  brand_color,
  business_name
}) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
Create a 1080x1080 Instagram banner HTML with inline CSS.
Background: <img class="bg" src="${image_url}" style="position:absolute;width:100%;height:100%;object-fit:cover">
Logo: <img class="logo" src="${logo_url}" style="position:absolute;top:30px;left:30px;width:120px;height:120px;object-fit:contain;background:white;border-radius:16px;padding:8px;border:3px solid white;box-shadow:0 6px 20px rgba(0,0,0,0.5)">
Text: "${text}"
Brand color: ${brand_color || '#FF6600'}
Business: "${business_name}"

Style: modern, clean, text-shadow, backdrop-filter.
Return ONLY the <div id="banner"> with 1080x1080 size.
`.trim();

  try {
    const result = await model.generateContent(prompt);
    let html = (await result.response).text();
    html = html.replace(/```html/g, '').replace(/```/g, '').trim();
    return `<div id="banner" style="width:1080px;height:1080px;position:relative;overflow:hidden;font-family:system-ui,sans-serif">${html}</div>`;
  } catch (err) {
    return `<div id="banner" style="width:1080px;height:1080px;background:#000;color:white;display:flex;align-items:center;justify-content:center;font-size:48px;padding:40px;text-align:center">
      ${text.replace(/\n/g, '<br>')}
    </div>`;
  }
}
