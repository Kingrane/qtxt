// app/api/get/route.ts
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Код не предоставлен :P' }, { status: 400 });
    }

    const text = await kv.getdel(code);

    if (!text) {
      return NextResponse.json({ error: 'Текст не найден или устарел :(' }, { status: 404 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера >:(' }, { status: 500 });
  }
}
