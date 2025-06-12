import type { APIRoute } from 'astro';

/**
 * moodeSKy OAuth Token Exchange Endpoint
 * 
 * AT Protocol OAuth 2.0 + DPoP準拠のトークン交換API
 * 
 * @see https://atproto.com/specs/oauth#token-endpoint
 * @see https://tools.ietf.org/html/rfc9449 (DPoP)
 * @see https://tools.ietf.org/html/rfc7636 (PKCE)
 * 
 * @cSpell:words dpop PKCE
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

    console.log('🔄 =============== Token Exchange Debug Info ===============');
    console.log('🔄 Grant Type:', tokenRequest.grant_type);
    console.log('🔄 Client ID:', tokenRequest.client_id);
    console.log('🔄 Redirect URI:', tokenRequest.redirect_uri);
    console.log('🔄 Has Authorization Code:', !!tokenRequest.code);
    console.log('🔄 Has Code Verifier:', !!tokenRequest.code_verifier);
    console.log('🔄 Has DPoP Header:', !!request.headers.get('DPoP'));
    console.log('🔄 Code Verifier Length:', tokenRequest.code_verifier?.length || 0);
    console.log('🔄 Authorization Code Length:', tokenRequest.code?.length || 0);
    if (request.headers.get('DPoP')) {
      console.log('🔄 DPoP Header Preview:', request.headers.get('DPoP')?.substring(0, 50) + '...');
    }
    console.log('🔄 Request Headers:', Object.fromEntries(request.headers.entries()));
    console.log('🔄 ======================================================');

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

    // DPoP proof検証（省略可能）
    const dpopHeader = request.headers.get('DPoP');
    if (!dpopHeader) {
      console.log('⚠️ DPoP header not provided - continuing without DPoP');
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
  request: Request
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

  try {
    // Bluesky OAuth serverの情報を取得
    const blueskyTokenEndpoint = 'https://bsky.social/oauth/token';
    
    console.log('🔗 Proxying token request to Bluesky OAuth server...');

    // DPoP proof検証とBlueskyへのリクエスト準備
    const dpopHeader = request.headers.get('DPoP');
    
    // PKCE code_challenge検証（実際の実装では保存された値と比較）
    console.log('🔍 Verifying PKCE code_verifier...');
    
    // Bluesky OAuth serverへのproxy request
    const formData = new URLSearchParams();
    formData.append('grant_type', tokenRequest.grant_type!);
    formData.append('code', tokenRequest.code!);
    formData.append('redirect_uri', tokenRequest.redirect_uri!);
    formData.append('client_id', tokenRequest.client_id!);
    formData.append('code_verifier', tokenRequest.code_verifier!);

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'moodeSky OAuth Proxy/1.0',
    };

    // DPoPヘッダーがある場合のみ追加
    if (dpopHeader) {
      requestHeaders['DPoP'] = dpopHeader;
      console.log('🔐 Using DPoP authentication');
    } else {
      console.log('⚠️ Proceeding without DPoP authentication');
    }

    const blueskyResponse = await fetch(blueskyTokenEndpoint, {
      method: 'POST',
      headers: requestHeaders,
      body: formData,
    });

    console.log('📡 =============== Bluesky OAuth Response ===============');
    console.log('📡 Response Status:', blueskyResponse.status);
    console.log('📡 Response Status Text:', blueskyResponse.statusText);
    console.log('📡 Response Headers:', Object.fromEntries(blueskyResponse.headers.entries()));
    console.log('📡 ======================================================');

    if (!blueskyResponse.ok) {
      const errorBody = await blueskyResponse.text();
      console.error('❌ =============== Bluesky OAuth Error ===============');
      console.error('❌ Status:', blueskyResponse.status);
      console.error('❌ Status Text:', blueskyResponse.statusText);
      console.error('❌ Error Body:', errorBody);
      console.error('❌ Error Headers:', Object.fromEntries(blueskyResponse.headers.entries()));
      console.error('❌ ===================================================');
      
      return new Response(
        JSON.stringify({
          error: 'invalid_grant',
          error_description: 'Authorization grant validation failed'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Blueskyからの成功レスポンスを取得
    const blueskyTokenData = await blueskyResponse.json();
    
    console.log('✅ Token exchange successful via Bluesky OAuth');
    console.log('🔑 Token type:', blueskyTokenData.token_type);
    console.log('⏰ Expires in:', blueskyTokenData.expires_in, 'seconds');
    console.log('👤 Subject:', blueskyTokenData.sub);

    // DPoP Nonceを転送
    const dpopNonce = blueskyResponse.headers.get('DPoP-Nonce');
    const responseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache'
    };

    if (dpopNonce) {
      responseHeaders['DPoP-Nonce'] = dpopNonce;
      console.log('🔐 DPoP-Nonce forwarded:', dpopNonce.substring(0, 20) + '...');
    }

    // Blueskyからのレスポンスをそのまま転送
    return new Response(
      JSON.stringify(blueskyTokenData),
      {
        status: 200,
        headers: responseHeaders
      }
    );

  } catch (error) {
    console.error('💥 Token exchange proxy error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'server_error',
        error_description: 'Failed to communicate with authorization server'
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Refresh Token Grant処理
 */
async function handleRefreshTokenGrant(
  tokenRequest: Partial<TokenRequest>,
  request: Request
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

  try {
    // Bluesky OAuth serverの情報を取得
    const blueskyTokenEndpoint = 'https://bsky.social/oauth/token';
    
    console.log('🔗 Proxying refresh token request to Bluesky OAuth server...');

    // DPoP proof検証とBlueskyへのリクエスト準備
    const dpopHeader = request.headers.get('DPoP');
    
    // Bluesky OAuth serverへのproxy request
    const formData = new URLSearchParams();
    formData.append('grant_type', tokenRequest.grant_type!);
    formData.append('refresh_token', tokenRequest.refresh_token!);
    formData.append('client_id', tokenRequest.client_id!);

    const refreshHeaders: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'moodeSky OAuth Proxy/1.0',
    };

    // DPoPヘッダーがある場合のみ追加
    if (dpopHeader) {
      refreshHeaders['DPoP'] = dpopHeader;
      console.log('🔐 Using DPoP for token refresh');
    } else {
      console.log('⚠️ Token refresh without DPoP authentication');
    }

    const blueskyResponse = await fetch(blueskyTokenEndpoint, {
      method: 'POST',
      headers: refreshHeaders,
      body: formData,
    });

    console.log(`📡 Bluesky OAuth refresh response: ${blueskyResponse.status}`);

    if (!blueskyResponse.ok) {
      const errorBody = await blueskyResponse.text();
      console.error('❌ Bluesky OAuth refresh error:', errorBody);
      
      return new Response(
        JSON.stringify({
          error: 'invalid_grant',
          error_description: 'Refresh token validation failed'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Blueskyからの成功レスポンスを取得
    const blueskyTokenData = await blueskyResponse.json();
    
    console.log('✅ Token refresh successful via Bluesky OAuth');
    console.log('🔑 New token type:', blueskyTokenData.token_type);
    console.log('⏰ New expires in:', blueskyTokenData.expires_in, 'seconds');

    // DPoP Nonceを転送
    const dpopNonce = blueskyResponse.headers.get('DPoP-Nonce');
    const responseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache'
    };

    if (dpopNonce) {
      responseHeaders['DPoP-Nonce'] = dpopNonce;
      console.log('🔐 DPoP-Nonce forwarded:', dpopNonce.substring(0, 20) + '...');
    }

    // Blueskyからのレスポンスをそのまま転送
    return new Response(
      JSON.stringify(blueskyTokenData),
      {
        status: 200,
        headers: responseHeaders
      }
    );

  } catch (error) {
    console.error('💥 Token refresh proxy error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'server_error',
        error_description: 'Failed to communicate with authorization server'
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Note: Mock JWT generation removed - using real Bluesky OAuth proxy implementation

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