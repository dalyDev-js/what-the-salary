import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get('title') ?? 'Salary Data';
  const min = searchParams.get('min') ?? '0';
  const max = searchParams.get('max') ?? '0';
  const avg = searchParams.get('avg') ?? '0';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          padding: '60px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'white', gap: '16px' }}>
          <p style={{ fontSize: 24, opacity: 0.8, margin: 0 }}>كام بياخد؟ — Kam Biyakhod?</p>
          <h1 style={{ fontSize: 56, fontWeight: 'bold', margin: 0, textAlign: 'center' }}>{title}</h1>
          <p style={{ fontSize: 24, opacity: 0.9, margin: 0 }}>in Egypt 🇪🇬</p>
          <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 14, opacity: 0.7 }}>Min</span>
              <span style={{ fontSize: 28, fontWeight: 'bold' }}>{Number(min).toLocaleString()} EGP</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 14, opacity: 0.7 }}>Avg</span>
              <span style={{ fontSize: 36, fontWeight: 'bold' }}>{Number(avg).toLocaleString()} EGP</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 14, opacity: 0.7 }}>Max</span>
              <span style={{ fontSize: 28, fontWeight: 'bold' }}>{Number(max).toLocaleString()} EGP</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
