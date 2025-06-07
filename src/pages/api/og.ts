import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const { searchParams } = url;
  const title = searchParams.get('title') || 'Scriptone';
  
  // シンプルなSVG画像を生成
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#grad)" />
      <rect width="1200" height="630" fill="rgba(0,0,0,0.4)" />
      
      <!-- Logo placeholder (circle) -->
      <circle cx="600" cy="250" r="60" fill="white" opacity="0.9" />
      <text x="600" y="260" text-anchor="middle" fill="#667eea" font-size="24" font-weight="bold" font-family="Arial">S</text>
      
      <!-- Title -->
      <text x="600" y="380" text-anchor="middle" fill="white" font-size="${title.length > 50 ? '36' : title.length > 30 ? '42' : '48'}" font-weight="bold" font-family="Arial">
        ${title.length > 60 ? title.substring(0, 60) + '...' : title}
      </text>
      
      <!-- Site name -->
      <text x="600" y="480" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="28" font-family="Arial">
        Scriptone
      </text>
    </svg>
  `;

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};