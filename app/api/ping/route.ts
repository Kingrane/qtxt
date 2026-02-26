// app/api/ping/route.ts
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const timestamp = Date.now();
    await kv.set('ping', timestamp, { ex: 604800 });
    return NextResponse.json({ success: true, timestamp });
  } catch (error) {
    console.error('Ping error:', error);
    return NextResponse.json({ error: 'Ping failed' }, { status: 500 });
  }
}
