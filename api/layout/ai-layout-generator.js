// layout/ai-layout-generator.js
export async function generateLayout({ text, image_url, logo_url, brand_color, business_name, tokens }) {
    
    // Используем токены если они есть, иначе генерируем базовые
    const designTokens = tokens || await generateBasicTokens(brand_color, business_name);
    
    const lines = text.split(/\\n|\n/).map(l => l.trim()).filter(l => l);
    const main = lines[0] || '';
    const sub = lines[1] || '';
    const hashtags = lines.slice(2).join(' ').trim();

    // Шаблон с использованием токенов
    const template = `
    <div id="banner" style="
        width:1080px;height:1080px;
        position:relative;
        background:url('${image_url}') center/cover;
        font-family:${designTokens.typography.fontFamily};
        color:${designTokens.colors.text};
        overflow:hidden;
    ">
        <img src="${logo_url}" style="
            position:absolute;
            top:${designTokens.spacing.lg};
            left:${designTokens.spacing.lg};
            width:180px;height:180px;
            object-fit:contain;
            background:white;
            border-radius:${designTokens.effects.borderRadius};
            padding:12px;
            border:4px solid white;
            box-shadow:${designTokens.effects.shadow};
            z-index:10;
        ">
        <div style="
            position:absolute;
            top:50%;right:${designTokens.spacing.lg};
            transform:translateY(-50%);
            text-align:right;
            max-width:55%;
        ">
            <h1 style="
                font-size:72px;
                margin:0;
                color:${designTokens.colors.primary};
                text-shadow:0 4px 16px rgba(0,0,0,0.8);
                font-weight:${designTokens.typography.weight};
            ">${business_name}</h1>
            <p style="
                font-size:42px;
                margin:${designTokens.spacing.sm} 0;
                color:${designTokens.colors.text};
                font-weight:bold;
            ">${main}</p>
            ${sub ? `<p style="font-size:32px;margin:8px 0;opacity:0.9;color:${designTokens.colors.text};">${sub}</p>` : ''}
        </div>
        ${hashtags ? `<div style="position:absolute;bottom:${designTokens.spacing.lg};left:50%;transform:translateX(-50%);font-size:24px;color:${designTokens.colors.text};background:rgba(255,255,255,0.8);padding:8px 20px;border-radius:20px;">${hashtags}</div>` : ''}
    </div>`;
    
    return template;
}

async function generateBasicTokens(brandColor, businessName) {
    return {
        colors: {
            primary: brandColor || '#007AFF',
            secondary: '#FFFFFF', 
            background: '#FFFFFF',
            text: '#000000',
            accent: brandColor || '#007AFF'
        },
        typography: {
            fontFamily: 'Helvetica Neue, sans-serif',
            weight: 'bold'
        },
        spacing: {
            xs: '8px',
            sm: '16px',
            md: '24px',
            lg: '32px',
            xl: '48px'
        },
        effects: {
            shadow: '0 4px 20px rgba(0,0,0,0.15)',
            borderRadius: '12px'
        }
    };
}
