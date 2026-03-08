import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || 'Islam.wiki'
  const subtitle = searchParams.get('subtitle') || ''
  const section = searchParams.get('section') || ''
  const arabic = searchParams.get('arabic') || ''

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
          background: 'linear-gradient(135deg, #0D2F17 0%, #1A1A2E 50%, #0D2F17 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Section badge */}
        {section && (
          <div
            style={{
              display: 'flex',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(201, 242, 122, 0.15)',
                color: '#C9F27A',
                padding: '8px 20px',
                borderRadius: '9999px',
                fontSize: '20px',
                fontWeight: 600,
              }}
            >
              {section}
            </div>
          </div>
        )}

        {/* Arabic text */}
        {arabic && (
          <div
            style={{
              fontSize: '40px',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '16px',
              direction: 'rtl',
              textAlign: 'right',
            }}
          >
            {arabic}
          </div>
        )}

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 40 ? '48px' : '56px',
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.2,
            marginBottom: '16px',
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              fontSize: '24px',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </div>
        )}

        {/* Footer branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            position: 'absolute',
            bottom: '40px',
            left: '80px',
          }}
        >
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#C9F27A',
            }}
          >
            Islam.wiki
          </div>
          <div
            style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.4)',
              marginLeft: '16px',
            }}
          >
            The Islamic Reference
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
