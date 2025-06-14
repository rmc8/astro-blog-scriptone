import type { APIRoute } from 'astro';

/**
 * moodeSKy OAuth Client Metadata Endpoint
 * 
 * AT Protocol OAuth 2.0 + DPoP対応のクライアントメタデータを提供
 * RAGから得た公式atproto.dart実装に準拠
 * 
 * @see https://atproto.com/specs/oauth#clients
 * @see https://github.com/myConsciousness/atproto.dart/tree/main/packages/atproto_oauth
 */
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const clientId = `${url.protocol}//${url.host}/api/moodesky/oauth/client-metadata.json`;

  // AT Protocol OAuth 2.0 + DPoP準拠メタデータ
  const metadata = {
      // 必須フィールド（atproto.dart OAuthClientMetadata準拠）
      client_id: clientId,
      application_type: "native", // モバイルアプリ用
      client_name: "moodeSky",
      client_uri: "https://rmc-8.com/moodesky",
      scope: "atproto",
      token_endpoint_auth_method: "none", // 公開クライアント

      // OAuth 2.0標準フィールド
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],

      // AT Protocol OAuth 2.0 DPoP対応（重要: セキュリティ強化）
      dpop_bound_access_tokens: true,

      // リダイレクトURI（HTTPのみ - Bluesky要件）
      redirect_uris: [
          // HTTPS リダイレクト（Vercel Functions用）
          `${url.protocol}//${url.host}/api/moodesky/oauth/callback`,

          // 本番用Webページ経由（アプリ起動リンク表示）
          `${url.protocol}//${url.host}/moodesky/oauth/callback`,
      ],
  };

  return new Response(JSON.stringify(metadata, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600', // 1時間キャッシュ（メタデータは変更頻度低）
      // CORS設定（OAuth認証サーバーからのアクセス許可）
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
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