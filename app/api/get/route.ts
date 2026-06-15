// app/api/get/route.ts
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'CODE_NOT_PROVIDED' }, { status: 400 });
    }

    const text = await kv.get<string>(code);

    if (!text) {
      return NextResponse.json({ error: 'TEXT_NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'SERVER_ERROR_GET' }, { status: 500 });
  }
}
