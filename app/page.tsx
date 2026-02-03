// app/page.tsx
'use client';

import { useState } from 'react';

type ContentMode = 'text' | 'code';

export default function Home() {
  const [mode, setMode] = useState<'share' | 'get'>('share');
  const [contentMode, setContentMode] = useState<ContentMode>('text');
  const [shareText, setShareText] = useState('');
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [getCode, setGetCode] = useState('');
  const [getText, setGetText] = useState<string | null>(null);
  const [getLoading, setGetLoading] = useState(false);
  const [getError, setGetError] = useState<string | null>(null);
  const [textCopied, setTextCopied] = useState(false);

  const handleShare = async () => {
    if (!shareText.trim()) {
      setShareError('Текст не может быть пустым :P');
      return;
    }
    setShareLoading(true);
    setShareError(null);
    setShareCode(null);

    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: shareText }),
      });

      if (!response.ok) {
        throw new Error('Не удалось поделиться текстом :/');
      }

      const data = await response.json();
      setShareCode(data.code);
      setShareText('');
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setShareLoading(false);
    }
  };

  const handleGet = async () => {
    if (!getCode.trim()) {
      setGetError('Код не может быть пустым :P');
      return;
    }
    setGetLoading(true);
    setGetError(null);
    setGetText(null);

    try {
      const response = await fetch(`/api/get?code=${getCode}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Текст не найден или устарел :(');
      }

      const data = await response.json();
      setGetText(data.text);
      setGetCode('');
    } catch (error) {
      setGetError(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setGetLoading(false);
    }
  };

  const handleCopy = () => {
    if (shareCode) {
      navigator.clipboard.writeText(shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyText = () => {
    if (getText) {
      navigator.clipboard.writeText(getText);
      setTextCopied(true);
      setTimeout(() => setTextCopied(false), 2000);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#FFF8E1] relative">
      <div className="w-full max-w-lg p-8 space-y-6 bg-[#FFFBF0] border-4 border-[#1A1A2E] shadow-[8px_8px_0px_0px_#1A1A2E]">
        <h1 className="text-4xl font-black text-center text-[#1A1A2E] uppercase tracking-tight">
          qtxt
        </h1>

        {/* Переключатель режимов */}
        <div className="flex gap-3">
          <button
            onClick={() => setMode('share')}
            className={`flex-1 py-3 px-4 font-bold border-4 border-[#1A1A2E] tracking-wide transition-all ${mode === 'share'
              ? 'bg-[#FF6B6B] text-[#1A1A2E] shadow-[4px_4px_0px_0px_#1A1A2E] translate-x-0 translate-y-0'
              : 'bg-[#FFFBF0] text-[#1A1A2E] hover:shadow-[4px_4px_0px_0px_#1A1A2E] hover:-translate-x-1 hover:-translate-y-1'
              }`}
          >
            Поделиться
          </button>
          <button
            onClick={() => setMode('get')}
            className={`flex-1 py-3 px-4 font-bold border-4 border-[#1A1A2E] tracking-wide transition-all ${mode === 'get'
              ? 'bg-[#4ECDC4] text-[#1A1A2E] shadow-[4px_4px_0px_0px_#1A1A2E] translate-x-0 translate-y-0'
              : 'bg-[#FFFBF0] text-[#1A1A2E] hover:shadow-[4px_4px_0px_0px_#1A1A2E] hover:-translate-x-1 hover:-translate-y-1'
              }`}
          >
            Получить
          </button>
        </div>

        {/* Режим "Поделиться" */}
        {mode === 'share' && (
          <div className="space-y-4">
            {/* Переключатель текст/код */}
            <div className="flex gap-1 justify-end">
              <button
                onClick={() => setContentMode('text')}
                className={`p-2 border-2 border-[#1A1A2E] transition-all ${
                  contentMode === 'text'
                    ? 'bg-[#FF6B6B] shadow-[2px_2px_0px_0px_#1A1A2E]'
                    : 'bg-[#FFFBF0] hover:shadow-[2px_2px_0px_0px_#1A1A2E]'
                }`}
                title="Текст"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="#1A1A2E" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </button>
              <button
                onClick={() => setContentMode('code')}
                className={`p-2 border-2 border-[#1A1A2E] transition-all ${
                  contentMode === 'code'
                    ? 'bg-[#4ECDC4] shadow-[2px_2px_0px_0px_#1A1A2E]'
                    : 'bg-[#FFFBF0] hover:shadow-[2px_2px_0px_0px_#1A1A2E]'
                }`}
                title="Код"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="#1A1A2E" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </button>
            </div>
            <textarea
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              placeholder={contentMode === 'code' ? "Введите ваш код здесь..." : "Введите ваш текст здесь..."}
              className={`w-full h-40 p-4 bg-[#FFFBF0] text-[#1A1A2E] border-4 border-[#1A1A2E] resize-none focus:outline-none focus:shadow-[6px_6px_0px_0px_#1A1A2E] transition-shadow font-medium placeholder:text-[#6B6B7B] placeholder:font-normal ${contentMode === 'code' ? 'font-mono text-sm' : ''}`}
              style={{ fontFamily: contentMode === 'code' ? 'var(--font-inter), monospace' : 'var(--font-comfortaa), sans-serif' }}
            />
            <button
              onClick={handleShare}
              disabled={shareLoading}
              className="w-full py-4 px-6 bg-[#FF6B6B] text-[#1A1A2E] font-black text-lg uppercase border-4 border-[#1A1A2E] shadow-[6px_6px_0px_0px_#1A1A2E] hover:shadow-[8px_8px_0px_0px_#1A1A2E] hover:-translate-x-1 hover:-translate-y-1 disabled:bg-[#D1D1D6] disabled:cursor-not-allowed disabled:transform-none transition-all active:shadow-[2px_2px_0px_0px_#1A1A2E] active:translate-x-1 active:translate-y-1"
            >
              {shareLoading ? 'Создание ссылки...' : 'Поделиться'}
            </button>
            {shareError && (
              <div className="p-4 bg-[#FF6B6B] border-4 border-[#1A1A2E] text-center">
                <p className="font-bold text-white">{shareError}</p>
              </div>
            )}
            {shareCode && (
              <div className="p-6 bg-[#C9B1FF] border-4 border-[#1A1A2E] shadow-[6px_6px_0px_0px_#1A1A2E]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#1A1A2E] mb-2 uppercase tracking-wider">Ваш код</p>
                    <p className="text-3xl font-black text-[#1A1A2E] break-all" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                      {shareCode}
                    </p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="p-3 bg-[#FAF7F2] border-4 border-[#1A1A2E] hover:shadow-[4px_4px_0px_0px_#1A1A2E] hover:-translate-x-1 hover:-translate-y-1 transition-all active:shadow-[1px_1px_0px_0px_#1A1A2E] active:translate-x-1 active:translate-y-1"
                  >
                    {copied ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1A1A2E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs font-bold text-[#1A1A2E] mt-4 opacity-70">
                  Текст будет удален через 10 минут.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Режим "Получить" */}
        {mode === 'get' && (
          <div className="space-y-4">
            <input
              type="text"
              value={getCode}
              onChange={(e) => setGetCode(e.target.value)}
              placeholder="Введите код для получения текста"
              className="w-full p-4 bg-[#FFFBF0] text-[#1A1A2E] border-4 border-[#1A1A2E] focus:outline-none focus:shadow-[6px_6px_0px_0px_#1A1A2E] transition-shadow font-bold text-lg placeholder:text-[#6B6B7B] placeholder:normal-case placeholder:font-normal placeholder:text-base"
            />
            <button
              onClick={handleGet}
              disabled={getLoading}
              className="w-full py-4 px-6 bg-[#4ECDC4] text-[#1A1A2E] font-black text-lg uppercase border-4 border-[#1A1A2E] shadow-[6px_6px_0px_0px_#1A1A2E] hover:shadow-[8px_8px_0px_0px_#1A1A2E] hover:-translate-x-1 hover:-translate-y-1 disabled:bg-[#D1D1D6] disabled:cursor-not-allowed disabled:transform-none transition-all active:shadow-[2px_2px_0px_0px_#1A1A2E] active:translate-x-1 active:translate-y-1"
            >
              {getLoading ? 'Загрузка...' : 'Получить текст'}
            </button>
            {getError && (
              <div className="p-4 bg-[#FF6B6B] border-4 border-[#1A1A2E] text-center">
                <p className="font-bold text-white">{getError}</p>
              </div>
            )}
            {getText && (
              <div className="bg-[#FFFBF0] border-4 border-[#1A1A2E] shadow-[6px_6px_0px_0px_#1A1A2E]">
                <div className="flex items-center justify-between px-4 py-3 bg-[#4ECDC4] border-b-4 border-[#1A1A2E]">
                  <p className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wider">Ваш текст</p>
                  <button
                    onClick={handleCopyText}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#FFFBF0] border-2 border-[#1A1A2E] text-sm font-bold text-[#1A1A2E] hover:shadow-[3px_3px_0px_0px_#1A1A2E] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                  >
                    {textCopied ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-[#22C55E]">Скопировано!</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#1A1A2E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        <span>Скопировать все</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto p-4 bg-[#FFF5D6]">
                  <p className="whitespace-pre-wrap text-[#1A1A2E] font-medium leading-relaxed break-words">
                    {getText}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============= РЕКЛАМНЫЙ БЛОК ============= */}
      <div className="mt-8 w-full max-w-lg">
        <script
          dangerouslySetInnerHTML={{
            __html: `
                window.yaContextCb.push(() => {
                    Ya.Context.AdvManager.render({
                        "blockId": "R-A-17962443-2",
                        "type": "floorAd",
                        "platform": "desktop"
                    })
                })
              `,
          }}
        />
      </div>
      {/* ========================================== */}

      {/* Ссылка внизу */}
      <a
        href="#"
        className="absolute bottom-4 text-sm font-medium text-[#1A1A2E] opacity-40 hover:opacity-70 transition-opacity underline"
      >
        быстрый обменник файлами
      </a>
    </main>
  );
}
