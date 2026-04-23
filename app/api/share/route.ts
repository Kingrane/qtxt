// app/api/share/route.ts
import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';

const MAX_TEXT_BYTES = 20 * 1024;

function isValidCustomCode(code: string): boolean {
  const trimmed = code.trim();
  return trimmed.length >= 4 && trimmed.length <= 10 && /^[a-zA-Z0-9_-]+$/.test(trimmed);
}

function getByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

export async function POST(request: NextRequest) {
  try {
    const { text, customCode } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Текст обязателен' }, { status: 400 });
    }

    if (getByteLength(text) > MAX_TEXT_BYTES) {
      return NextResponse.json({ error: 'Слишком большой текст. Максимум 20KB.' }, { status: 413 });
    }

    let code: string;
    
    if (customCode && typeof customCode === 'string') {
      const trimmedCode = customCode.trim();
      if (!isValidCustomCode(trimmedCode)) {
        return NextResponse.json({ error: 'Код должен быть 4-10 символов (a-z, A-Z, 0-9, _, -)' }, { status: 400 });
      }
      code = trimmedCode;
    } else {
      code = nanoid(5);
    }

    await kv.set(code, text, { ex: 600 });

    return NextResponse.json({ code });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
