// app/api/help/route.ts
import { NextRequest, NextResponse } from 'next/server';

const HELP_TEXT = `qtxt CLI

Получить текст по коду:
  curl -s "https://qqtxt.me/api/get?code=ABCD&format=plain"

Отправить текст (stdin) и получить код:
  printf "%s" "много строк\nвот так" | curl -s -X POST "https://qqtxt.me/api/share?format=plain" -H "Content-Type: text/plain" --data-binary @-

Отправить файл и получить код:
  curl -s -X POST "https://qqtxt.me/api/share?format=plain" -H "Content-Type: text/plain" --data-binary @"./file.txt"

Свой код:
  curl -s -X POST "https://qqtxt.me/api/share?code=MYCODE&format=plain" -H "Content-Type: text/plain" --data-binary @"./file.txt"

Подсказка: ответом всегда будет сам код или текст (plain).
`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format');
  const wantsPlain = format === 'plain' || request.headers.get('accept')?.includes('text/plain');

  if (wantsPlain) {
    return new NextResponse(HELP_TEXT, { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }

  return NextResponse.json({ help: HELP_TEXT });
}
