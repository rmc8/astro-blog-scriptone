import type { APIRoute } from 'astro';
import { createHash } from 'crypto';

/**
 * moodeSKy OAuth Token Exchange Endpoint
 * 
 * AT Protocol OAuth 2.0 + DPoP準拠のトークン交換API
 * 
 * @see https://atproto.com/specs/oauth#token-endpoint
 * @see https://tools.ietf.org/html/rfc9449 (DPoP)
 * @see https://tools.ietf.org/html/rfc7636 (PKCE)
 */

interface TokenRequest {
  grant_type: 'authorization_code' | 'refresh_token';
  code?: string;
  redirect_uri?: string;
  client_id: string;
  code_verifier?: string;
  refresh_token?: string;
  dpop_proof?: string;
}

interface TokenResponse {
  access_token: string;
  token_type: 'DPoP';
  expires_in: number;
  refresh_token: string;
  scope: string;
  sub: string;
}

// DPoP Proof interface (for future implementation)
// interface DPoPProof {
//   typ: 'dpop+jwt';
//   alg: 'ES256';
//   jwk: {
//     kty: 'EC';
//     crv: 'P-256';
//     x: string;
//     y: string;
//   };
// }

export const POST: APIRoute = async ({ request }) => {
  try {
    // Content-Type検証
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/x-www-form-urlencoded')) {
      return new Response(
        JSON.stringify({
          error: 'invalid_request',
          error_description: 'Content-Type must be application/x-www-form-urlencoded'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // リクエストボディの解析
    const formData = await request.formData();
    const tokenRequest: Partial<TokenRequest> = {};
    
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        (tokenRequest as any)[key] = value;
      }
    }

    console.log('🔄 Token exchange request:', {
      grant_type: tokenRequest.grant_type,
      client_id: tokenRequest.client_id,
      redirect_uri: tokenRequest.redirect_uri,
      has_code: !!tokenRequest.code,
      has_code_verifier: !!tokenRequest.code_verifier,
      has_dpop_proof: !!request.headers.get('DPoP')
    });

    // 必須パラメータ検証
    if (!tokenRequest.grant_type || !tokenRequest.client_id) {
      return new Response(
        JSON.stringify({
          error: 'invalid_request',
          error_description: 'Missing required parameters: grant_type, client_id'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Client ID検証
    const expectedClientId = `${new URL(request.url).origin}/api/moodesky/oauth/client-metadata.json`;
    if (tokenRequest.client_id !== expectedClientId) {
      return new Response(
        JSON.stringify({
          error: 'invalid_client',
          error_description: 'Invalid client_id'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // DPoP proof検証
    const dpopHeader = request.headers.get('DPoP');
    if (!dpopHeader) {
      return new Response(
        JSON.stringify({
          error: 'invalid_request',
          error_description: 'DPoP proof required'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Grant type別処理
    if (tokenRequest.grant_type === 'authorization_code') {
      return await handleAuthorizationCodeGrant(tokenRequest, request);
    } else if (tokenRequest.grant_type === 'refresh_token') {
      return await handleRefreshTokenGrant(tokenRequest, request);
    } else {
      return new Response(
        JSON.stringify({
          error: 'unsupported_grant_type',
          error_description: 'Unsupported grant type'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('❌ Token exchange error:', error);
    return new Response(
      JSON.stringify({
        error: 'server_error',
        error_description: 'Internal server error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

/**
 * Authorization Code Grant処理
 */
async function handleAuthorizationCodeGrant(
  tokenRequest: Partial<TokenRequest>,
  _request: Request
): Promise<Response> {
  // 必須パラメータ検証
  if (!tokenRequest.code || !tokenRequest.redirect_uri || !tokenRequest.code_verifier) {
    return new Response(
      JSON.stringify({
        error: 'invalid_request',
        error_description: 'Missing required parameters for authorization_code grant'
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  console.log('🔐 Processing authorization code grant...');

  // TODO: 実際の実装では以下を行う必要があります：
  // 1. 認証コードの検証と期限チェック
  // 2. リダイレクトURIの検証
  // 3. PKCE code_verifierの検証
  // 4. DPoP proof の詳細検証
  // 5. Bluesky OAuth serverへのプロキシリクエスト

  // プレースホルダー実装: モック応答
  const mockTokenResponse: TokenResponse = {
    access_token: generateMockJWT('access', tokenRequest.client_id!),
    token_type: 'DPoP',
    expires_in: 3600, // 1時間
    refresh_token: generateMockJWT('refresh', tokenRequest.client_id!),
    scope: 'atproto',
    sub: 'did:plc:mock-user-identifier'
  };

  console.log('✅ Token exchange successful (mock)');

  return new Response(
    JSON.stringify(mockTokenResponse),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    }
  );
}

/**
 * Refresh Token Grant処理
 */
async function handleRefreshTokenGrant(
  tokenRequest: Partial<TokenRequest>,
  _request: Request
): Promise<Response> {
  if (!tokenRequest.refresh_token) {
    return new Response(
      JSON.stringify({
        error: 'invalid_request',
        error_description: 'Missing refresh_token parameter'
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  console.log('🔄 Processing refresh token grant...');

  // TODO: 実際の実装では以下を行う必要があります：
  // 1. Refresh tokenの検証
  // 2. DPoP proof の詳細検証
  // 3. Bluesky OAuth serverへのプロキシリクエスト

  // プレースホルダー実装: エラー返却
  return new Response(
    JSON.stringify({
      error: 'temporarily_unavailable',
      error_description: 'Refresh token grant not yet implemented'
    }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * モックJWT生成（開発・テスト用）
 */
function generateMockJWT(type: 'access' | 'refresh', clientId: string): string {
  const header = {
    typ: 'JWT',
    alg: 'HS256'
  };

  const payload = {
    iss: new URL(clientId).origin,
    sub: 'did:plc:mock-user-identifier',
    aud: 'https://bsky.social',
    exp: Math.floor(Date.now() / 1000) + (type === 'access' ? 3600 : 86400),
    iat: Math.floor(Date.now() / 1000),
    scope: 'atproto',
    client_id: clientId,
    token_type: type
  };

  // 注意: 実際の実装では適切な署名を使用してください
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
  const signature = createHash('sha256')
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// CORS対応
export const OPTIONS: APIRoute = () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, DPoP, Authorization',
    }
  });
};