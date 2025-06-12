import type { APIRoute } from 'astro';

/**
 * OAuth Debug Logs API
 * 
 * セキュリティ配慮済みのOAuth認証ログを返す
 * 認証コードやトークンなどの機密情報は除外
 */

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  category?: string;
}

// メモリ内ログストレージ（本来はRedisやDBを使用）
let recentLogs: LogEntry[] = [];
const MAX_LOGS = 50;

// ログ追加関数
export function addDebugLog(level: LogEntry['level'], message: string, category?: string) {
  const timestamp = new Date().toISOString();
  
  // セキュリティ: 機密情報をマスク
  const sanitizedMessage = sanitizeLogMessage(message);
  
  const logEntry: LogEntry = {
    timestamp,
    level,
    message: sanitizedMessage,
    category
  };
  
  recentLogs.push(logEntry);
  
  // ログ数制限
  if (recentLogs.length > MAX_LOGS) {
    recentLogs = recentLogs.slice(-MAX_LOGS);
  }
  
  // コンソールにも出力
  console.log(`[OAuth Debug] [${level.toUpperCase()}] ${sanitizedMessage}`);
}

// セキュリティ: 機密情報のマスキング
function sanitizeLogMessage(message: string): string {
  return message
    // 認証コード
    .replace(/code=[\w\-_]+/gi, 'code=[REDACTED]')
    .replace(/authorization code:?\s*[\w\-_]+/gi, 'authorization code: [REDACTED]')
    
    // アクセストークン・リフレッシュトークン
    .replace(/access_token["\s]*:?\s*[\w\-_\.]+/gi, 'access_token: [REDACTED]')
    .replace(/refresh_token["\s]*:?\s*[\w\-_\.]+/gi, 'refresh_token: [REDACTED]')
    .replace(/bearer\s+[\w\-_\.]+/gi, 'Bearer [REDACTED]')
    
    // DPoP proofs
    .replace(/dpop["\s]*:?\s*[\w\-_\.]+/gi, 'dpop: [REDACTED]')
    
    // PKCE code verifier
    .replace(/code_verifier["\s]*:?\s*[\w\-_]+/gi, 'code_verifier: [REDACTED]')
    
    // ユーザー識別情報
    .replace(/did:plc:[\w]+/gi, 'did:plc:[REDACTED]')
    .replace(/sub["\s]*:?\s*did:plc:[\w]+/gi, 'sub: did:plc:[REDACTED]')
    
    // 一般的な機密パターン
    .replace(/password["\s]*:?\s*\S+/gi, 'password: [REDACTED]')
    .replace(/secret["\s]*:?\s*\S+/gi, 'secret: [REDACTED]')
    .replace(/key["\s]*:?\s*[\w\-_\.]{20,}/gi, 'key: [REDACTED]');
}

export const GET: APIRoute = async ({ request }) => {
  try {
    // CORS設定
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 最近5分間のログのみ返す
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentDebugLogs = recentLogs.filter(log => 
      new Date(log.timestamp) > fiveMinutesAgo
    );

    // デバッグ用の追加情報
    addDebugLog('info', `Debug logs requested - returning ${recentDebugLogs.length} entries`);

    return new Response(
      JSON.stringify({
        success: true,
        count: recentDebugLogs.length,
        logs: recentDebugLogs,
        generated_at: new Date().toISOString(),
        notice: 'Sensitive information has been redacted for security'
      }, null, 2),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          ...corsHeaders
        }
      }
    );

  } catch (error) {
    console.error('Debug logs API error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to retrieve debug logs',
        logs: []
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
};

export const OPTIONS: APIRoute = () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
};

// 初期ログ
addDebugLog('info', 'OAuth Debug Logs API initialized');