import type { APIRoute } from 'astro';

/**
 * moodeSky OAuth Client Metadata Endpoint (Development)
 * 
 * 開発環境用のシンプルなclient metadata
 * RFC 8252準拠でlocalhost URLを除外
 */
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const clientId = `${url.protocol}//${url.host}/api/moodesky/oauth/client-metadata-dev.json`;

  // 開発環境用シンプルメタデータ（RFC 8252準拠）
  const metadata = {
    client_id: clientId,
    application_type: "native",
    client_name: "moodeSky Development",
    client_uri: `${url.protocol}//${url.host}/moodesky`,
    scope: "atproto",
    token_endpoint_auth_method: "none",
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    dpop_bound_access_tokens: true,
    redirect_uris: [
      // HTTPS リダイレクト（Vercel Functions用 - 開発・本番共通）
      `${url.protocol}//${url.host}/api/moodesky/oauth/callback`,
      
      // 本番用Webページ経由（アプリ起動リンク表示）
      `${url.protocol}//${url.host}/moodesky/oauth/callback`
    ]
  };

  return new Response(JSON.stringify(metadata, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
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