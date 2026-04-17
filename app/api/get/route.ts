// app/api/get/route.ts
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const format = searchParams.get('format');
    const wantsPlain = format === 'plain' || request.headers.get('accept')?.includes('text/plain');

    if (!code) {
      if (wantsPlain) {
        return new NextResponse('Код не предоставлен :/', { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      }
      return NextResponse.json({ error: 'Код не предоставлен :/' }, { status: 400 });
    }

    const text = await kv.get<string>(code);

    if (!text) {
      if (wantsPlain) {
        return new NextResponse('Текст не найден или устарел :(', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      }
      return NextResponse.json({ error: 'Текст не найден или устарел :(' }, { status: 404 });
    }

    if (wantsPlain) {
      return new NextResponse(text, { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
    return NextResponse.json({ text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера >:(' }, { status: 500 });
  }
}
