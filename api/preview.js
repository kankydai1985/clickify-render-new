// api/preview.js
import { generateLayout } from './layout/ai-layout-generator.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { text, image_url, logo_url, brand_color, business_name } = req.body;
  if (!text || !image_url) return res.status(400).json({ error: 'Missing data' });

  try {
    const html = await generateLayout({ text, image_url, logo_url, brand_color, business_name });
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).json({ error: 'AI failed: ' + err.message });
  }
}
