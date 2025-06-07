import type { APIRoute } from 'astro';
import { ImageResponse } from '@vercel/og';

export const GET: APIRoute = async ({ url }) => {
  const { searchParams } = url;
  const title = searchParams.get('title') || 'Scriptone';
  const locale = searchParams.get('locale') || 'ja';

  // ロゴの読み込み（Base64エンコードされた画像データまたはURL）
  const logoUrl = 'https://rmc-8.com/scriptone_logo_icon.png';

  // フォントの設定（日本語、韓国語、英語対応）
  const getFontFamily = (locale: string) => {
    switch (locale) {
      case 'ko':
        return 'Noto Sans KR';
      case 'ja':
        return 'Noto Sans JP';
      default:
        return 'Inter';
    }
  };

  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: '630px',
            width: '1200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative',
          }}
        >
          {/* Background overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
            }}
          />
          
          {/* Content container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px',
              zIndex: 1,
              textAlign: 'center',
            }}
          >
            {/* Logo */}
            <img
              src={logoUrl}
              alt="Scriptone Logo"
              width="120"
              height="120"
              style={{
                marginBottom: '40px',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              }}
            />
            
            {/* Title */}
            <h1
              style={{
                fontSize: title.length > 50 ? '48px' : title.length > 30 ? '56px' : '64px',
                fontWeight: 'bold',
                color: 'white',
                lineHeight: '1.2',
                marginBottom: '20px',
                maxWidth: '1000px',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                fontFamily: getFontFamily(locale),
              }}
            >
              {title}
            </h1>
            
            {/* Site name */}
            <p
              style={{
                fontSize: '32px',
                color: 'rgba(255, 255, 255, 0.9)',
                margin: 0,
                fontFamily: getFontFamily(locale),
                textShadow: '0 1px 5px rgba(0, 0, 0, 0.3)',
              }}
            >
              Scriptone
            </p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    console.error('OG Image generation error:', error);
    
    // フォールバック画像（シンプルなテキストベース）
    return new ImageResponse(
      (
        <div
          style={{
            height: '630px',
            width: '1200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1f2937',
            color: 'white',
          }}
        >
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              textAlign: 'center',
              maxWidth: '1000px',
              lineHeight: '1.2',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: '32px',
              marginTop: '20px',
              opacity: 0.8,
            }}
          >
            Scriptone
          </p>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  }
};