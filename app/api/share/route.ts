// app/api/share/route.ts
import { kv } from '@vercel/kv';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: 'Текст обязателен' }, { status: 400 });
        }

        const code = nanoid(7); // Генерируем код из 7 символов

        // Сохраняем текст в KV с кодом как ключ.
        // { ex: 86400 } - устанавливаем время жизни записи на 24 часа (в секундах)
        await kv.set(code, text, { ex: 86400 });

        return NextResponse.json({ code });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
    }
}