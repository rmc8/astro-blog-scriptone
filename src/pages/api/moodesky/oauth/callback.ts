import type { APIRoute } from 'astro';

/**
 * moodeSky OAuth Callback Handler
 * 
 * Blueskyからの認証コールバックを受け取り、
 * Flutterアプリのカスタムスキームにリダイレクトする
 * 
 * @see RFC 8252 - OAuth 2.0 for Native Apps
 * @see https://atproto.com/specs/oauth
 */
export const GET: APIRoute = async ({ request, url }) => {
  try {
    // URLパラメータを取得
    const params = url.searchParams;
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    console.log('OAuth Callback received:', {
      code: code ? code.substring(0, 20) + '...' : null,
      state: state ? state.substring(0, 20) + '...' : null,
      error,
      errorDescription
    });

    // カスタムURLスキームのベースURL
    const mobileCallbackScheme = 'moodesky://oauth/callback';
    
    // エラーケースの処理
    if (error) {
      const errorParams = new URLSearchParams({
        error,
        ...(errorDescription && { error_description: errorDescription }),
        ...(state && { state })
      });
      
      const errorUrl = `${mobileCallbackScheme}?${errorParams.toString()}`;
      
      console.log('OAuth error, redirecting to:', errorUrl);
      
      return new Response(null, {
        status: 302,
        headers: {
          'Location': errorUrl,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    // 成功ケース：code と state が必要
    if (!code || !state) {
      const missingParams = new URLSearchParams({
        error: 'invalid_request',
        error_description: 'Missing required parameters: code or state',
        ...(state && { state })
      });
      
      const errorUrl = `${mobileCallbackScheme}?${missingParams.toString()}`;
      
      console.log('Missing parameters, redirecting to:', errorUrl);
      
      return new Response(null, {
        status: 302,
        headers: {
          'Location': errorUrl,
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    // 成功時のパラメータ構築
    const successParams = new URLSearchParams({
      code,
      state
    });
    
    const successUrl = `${mobileCallbackScheme}?${successParams.toString()}`;
    
    console.log('OAuth success, redirecting to app:', successUrl);
    
    // モバイルアプリにリダイレクト
    return new Response(null, {
      status: 302,
      headers: {
        'Location': successUrl,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (err) {
    console.error('OAuth callback handler error:', err);
    
    // 重大なエラー時のフォールバック
    const fallbackError = new URLSearchParams({
      error: 'server_error',
      error_description: 'Internal server error during OAuth callback'
    });
    
    const fallbackUrl = `moodesky://oauth/callback?${fallbackError.toString()}`;
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': fallbackUrl,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
};

/**
 * OPTIONS リクエスト対応（CORS preflight）
 */
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-cache'
    }
  });
};

/**
 * POST リクエスト対応（一部のOAuthプロバイダー用）
 */
export const POST: APIRoute = async (context) => {
  // POSTの場合もGETと同じ処理
  return GET(context);
};