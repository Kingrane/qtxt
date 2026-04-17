// app/api/share/route.ts
import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';

function isValidCustomCode(code: string): boolean {
  const trimmed = code.trim();
  return trimmed.length >= 4 && trimmed.length <= 10 && /^[a-zA-Z0-9_-]+$/.test(trimmed);
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const isPlainText = contentType.includes('text/plain');
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');
    const wantsPlain = format === 'plain' || request.headers.get('accept')?.includes('text/plain');

    const body = isPlainText ? { text: await request.text() } : await request.json();
    const text = body?.text;
    const customCode = body?.customCode ?? searchParams.get('code');

    if (!text || typeof text !== 'string') {
      if (wantsPlain || isPlainText) {
        return new NextResponse('Текст обязателен', { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      }
      return NextResponse.json({ error: 'Текст обязателен' }, { status: 400 });
    }

    let code: string;

    if (customCode && typeof customCode === 'string') {
      const trimmedCode = customCode.trim();
      if (!isValidCustomCode(trimmedCode)) {
        if (wantsPlain || isPlainText) {
          return new NextResponse('Код должен быть 4-10 символов (a-z, A-Z, 0-9, _, -)', { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
        }
        return NextResponse.json({ error: 'Код должен быть 4-10 символов (a-z, A-Z, 0-9, _, -)' }, { status: 400 });
      }
      code = trimmedCode;
    } else {
      code = nanoid(5);
    }

    await kv.set(code, text, { ex: 600 });

    if (wantsPlain || isPlainText) {
      return new NextResponse(code, { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
    return NextResponse.json({ code });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
