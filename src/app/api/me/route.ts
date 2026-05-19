import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

function decodeOAuth(token: string) {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, user: null },
      { status: 200 }
    );
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    return NextResponse.json({
      success: true,
      user: {
        uid: String(decoded.uid),
        name: decoded.name || 'Stanar',
        role: decoded.roles?.[0] || 'stanar',
        picture: decoded.picture,
      },
    });
  } catch {}

  const oauth = decodeOAuth(token);

  if (!oauth?.sub) {
    return NextResponse.json(
      { success: false, user: null },
      { status: 200 }
    );
  }

  try {
    const res = await fetch(
      `https://dev-stambena-zajednica.pantheonsite.io/api/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { success: false, user: null },
        { status: 200 }
      );
    }

    const data = await res.json();

    return NextResponse.json({
      success: true,
      user: {
        uid: String(data.uid),
        name: data.name || 'Upravnik',
        role: 'upravnik',
        picture:
          data.picture ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            data.name || 'Upravnik'
          )}`,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, user: null },
      { status: 200 }
    );
  }
}
