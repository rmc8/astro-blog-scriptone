import type { APIRoute } from 'astro';

/**
 * Android App Links - Digital Asset Links
 * 
 * MoodeSkyアプリのAndroid App Linksを有効にするための
 * デジタルアセットリンクファイル
 * 
 * @see https://developers.google.com/digital-asset-links/v1/getting-started
 */
export const GET: APIRoute = async () => {
  const assetLinks = [
    {
      "relation": ["delegate_permission/common.handle_all_urls"],
      "target": {
        "namespace": "android_app",
        "package_name": "com.moodesky.app", // Flutterアプリのパッケージ名
        "sha256_cert_fingerprints": [
          // 開発用証明書のSHA256フィンガープリント
          "FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C",
          // リリース用証明書のSHA256フィンガープリント（本番環境用）
          // "XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX"
        ]
      }
    }
  ];

  return new Response(JSON.stringify(assetLinks, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400', // 24時間キャッシュ
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};