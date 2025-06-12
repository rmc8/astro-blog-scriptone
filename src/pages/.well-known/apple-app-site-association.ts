import type { APIRoute } from 'astro';

/**
 * iOS Universal Links - Apple App Site Association
 * 
 * MoodeSkyアプリのiOS Universal Linksを有効にするための
 * Apple App Site Associationファイル
 * 
 * @see https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app
 */
export const GET: APIRoute = async () => {
  const appSiteAssociation = {
    "applinks": {
      "details": [
        {
          "appIDs": [
            // 開発用App ID（Team ID + Bundle ID）
            "XXXXXXXXXX.com.moodesky.app", // Team IDを実際の値に置き換える
            // 本番用App ID（必要に応じて追加）
            // "YYYYYYYYYY.com.moodesky.app"
          ],
          "components": [
            {
              // OAuth コールバック用パス
              "/moodesky/oauth/callback": "*",
              "comment": "MoodeSky OAuth callback"
            },
            {
              // API コールバック用パス
              "/api/moodesky/oauth/callback": "*",
              "comment": "MoodeSky API OAuth callback"
            }
          ]
        }
      ]
    },
    "webcredentials": {
      "apps": [
        // WebAuthn用（将来の機能拡張用）
        "XXXXXXXXXX.com.moodesky.app"
      ]
    },
    "appclips": {
      // App Clips用（将来の機能拡張用）
      "apps": []
    }
  };

  return new Response(JSON.stringify(appSiteAssociation, null, 2), {
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