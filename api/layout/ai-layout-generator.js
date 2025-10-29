// layout/ai-layout-generator.js
export async function generateLayout({ text, image_url, logo_url, brand_color, business_name }) {
  // РАЗБИВАЕМ ТОЛЬКО ПО \\n (ЭКРАНИРОВАННЫЙ ПЕРЕНОС)
  const lines = text.split('\\n').map(l => l.trim()).filter(l => l);
  const main = lines[0] || '';
  const sub = lines[1] || '';
  const hashtags = lines.slice(2).join(' ').trim();

  const templates = [

    // ШАБЛОН 1
    `<div id="banner" style="width:1080px;height:1080px;position:relative;background:url('${image_url}') center/cover;overflow:hidden;font-family:'Helvetica Neue',sans-serif;">
      <img src="${logo_url}" style="position:absolute;top:60px;left:60px;width:200px;height:200px;object-fit:contain;background:white;border-radius:30px;padding:16px;border:6px solid white;box-shadow:0 12px 40px rgba(0,0,0,0.6);z-index:10;">
      <div style="position:absolute;top:50%;right:60px;transform:translateY(-50%);text-align:right;max-width:55%;">
        <h1 style="font-size:82px;margin:0;line-height:1;font-weight:900;color:${brand_color};text-shadow:0 6px 20px rgba(0,0,0,0.8);">${business_name}</h1>
        <p style="font-size:50px;margin:16px 0;font-weight:700;color:white;text-shadow:0 4px 16px rgba(0,0,0,0.8);">${main}</p>
        ${sub ? `<p style="font-size:38px;margin:8px 0;color:#fff;opacity:0.9;">${sub}</p>` : ''}
      </div>
      ${hashtags ? `<div style="position:absolute;bottom:60px;left:50%;transform:translateX(-50%);font-size:34px;color:#fff;background:rgba(0,0,0,0.5);padding:10px 30px;border-radius:50px;">${hashtags}</div>` : ''}
    </div>`,

    // ШАБЛОН 2
    `<div id="banner" style="width:1080px;height:1080px;position:relative;background:linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('${image_url}') center/cover;font-family:'Arial Black',sans-serif;">
      <img src="${logo_url}" style="position:absolute;top:40px;left:50%;transform:translateX(-50%);width:180px;height:180px;object-fit:contain;background:white;border-radius:50%;padding:12px;box-shadow:0 10px 30px rgba(0,0,0,0.7);z-index:10;">
      <div style="position:absolute;bottom:100px;left:50%;transform:translateX(-50%);text-align:center;max-width:90%;">
        <h1 style="font-size:88px;margin:0;color:${brand_color};text-shadow:0 6px 20px rgba(0,0,0,0.9);">${main}</h1>
        <p style="font-size:44px;margin:20px 0;color:white;text-shadow:0 4px 14px rgba(0,0,0,0.8);">${business_name}</p>
      </div>
      ${hashtags ? `<div style="position:absolute;bottom:40px;left:50%;transform:translateX(-50%);font-size:32px;color:#fff;">${hashtags}</div>` : ''}
    </div>`,

    // ШАБЛОН 3
    `<div id="banner" style="width:1080px;height:1080px;position:relative;background:url('${image_url}') center/cover;overflow:hidden;font-family:system-ui,sans-serif;">
      <div style="position:absolute;top:80px;left:50%;transform:translateX(-50%);text-align:center;max-width:80%;background:rgba(255,255,255,0.15);padding:32px;border-radius:20px;border:4px solid rgba(255,255,255,0.3);backdrop-filter:blur(4px);">
        <h1 style="font-size:78px;margin:0;color:${brand_color};text-shadow:0 4px 16px rgba(0,0,0,0.7);">${main}</h1>
        <p style="font-size:46px;margin:16px 0;color:white;">${sub || business_name}</p>
      </div>
      <img src="${logo_url}" style="position:absolute;bottom:60px;left:50%;transform:translateX(-50%);width:160px;height:160px;object-fit:contain;background:white;border-radius:25px;padding:14px;box-shadow:0 8px 30px rgba(0,0,0,0.6);">
      ${hashtags ? `<div style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);font-size:30px;color:#fff;">${hashtags}</div>` : ''}
    </div>`,

    // ШАБЛОН 4
    `<div id="banner" style="width:1080px;height:1080px;position:relative;background:url('${image_url}') center/cover;overflow:hidden;font-family:'Impact',sans-serif;">
      <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(45deg, transparent 48%, rgba(255,102,0,0.2) 50%, transparent 52%);"></div>
      <img src="${logo_url}" style="position:absolute;bottom:60px;right:60px;width:190px;height:190px;object-fit:contain;background:white;border-radius:30px;padding:16px;transform:rotate(8deg);box-shadow:0 12px 40px rgba(0,0,0,0.7);z-index:10;">
      <div style="position:absolute;top:120px;left:80px;max-width:50%;color:white;">
        <h1 style="font-size:86px;margin:0;line-height:1;color:${brand_color};text-shadow:0 6px 20px rgba(0,0,0,0.9);">${business_name}</h1>
        <p style="font-size:48px;margin:20px 0;font-weight:bold;text-shadow:0 4px 14px rgba(0,0,0,0.8);">${main}</p>
        ${sub ? `<p style="font-size:36px;margin:8px 0;opacity:0.9;">${sub}</p>` : ''}
      </div>
      ${hashtags ? `<div style="position:absolute;bottom:60px;left:60px;font-size:32px;color:#fff;background:rgba(0,0,0,0.4);padding:8px 20px;border-radius:30px;">${hashtags}</div>` : ''}
    </div>`,

    // ШАБЛОН 5
    `<div id="banner" style="width:1080px;height:1080px;position:relative;background:url('${image_url}') center/cover;overflow:hidden;font-family:'Montserrat',sans-serif;display:flex;align-items:center;justify-content:center;">
      <div style="position:absolute;inset:0;background:radial-gradient(circle at center, rgba(0,0,0,0.1), rgba(0,0,0,0.6));"></div>
      <img src="${logo_url}" style="position:absolute;top:60px;left:60px;width:150px;height:150px;object-fit:contain;background:white;border-radius:50%;padding:12px;box-shadow:0 8px 30px rgba(0,0,0,0.6);z-index:10;">
      <div style="text-align:center;color:white;max-width:80%;z-index:5;">
        <h1 style="font-size:92px;margin:0;line-height:1;font-weight:900;color:${brand_color};text-shadow:0 6px 20px rgba(0,0,0,0.9);">${main}</h1>
        <p style="font-size:50px;margin:24px 0;font-weight:700;text-shadow:0 4px 16px rgba(0,0,0,0.8);">${business_name}</p>
        ${hashtags ? `<p style="font-size:32px;margin:0;opacity:0.9;">${hashtags}</p>` : ''}
      </div>
    </div>`

  ];

  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}
