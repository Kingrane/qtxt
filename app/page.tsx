// app/page.tsx
'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import confetti from 'canvas-confetti';

type ViewMode = 'plain' | 'highlight';

const highlightCustomStyle = {
  ...oneLight,
  'pre[class*="language-"]': {
    ...oneLight['pre[class*="language-"]'],
    background: 'transparent',
    margin: 0,
    padding: '1rem',
    fontFamily: 'var(--font-inter), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  'code[class*="language-"]': {
    ...oneLight['code[class*="language-"]'],
    background: 'transparent',
    fontFamily: 'var(--font-inter), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
};

const detectLanguage = (code: string): string => {
  if (!code) return 'text';

  if (code.includes('<!DOCTYPE') || code.includes('<html') || (code.includes('<') && code.includes('>'))) {
    return 'html';
  }
  if (code.includes('{') && code.includes('}') && (code.includes(':') || code.includes('@media'))) {
    return 'css';
  }
  if ((code.trim().startsWith('{') && code.includes('"')) || code.trim().startsWith('[')) {
    try {
      JSON.parse(code);
      return 'json';
    } catch { }
  }
  if (code.includes('def ') || code.includes('import ') || code.includes('print(') || code.includes('class ') && code.includes(':')) {
    return 'python';
  }
  if (code.includes('const ') || code.includes('let ') || code.includes('var ') || code.includes('function') || code.includes('=>')) {
    return 'typescript';
  }
  if (code.match(/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP)\b/i)) {
    return 'sql';
  }
  if (code.includes('#!/bin/bash') || code.includes('echo ') || code.includes('git ')) {
    return 'bash';
  }

  return 'text';
};

export default function Home() {
  const [mode, setMode] = useState<'share' | 'get'>('share');
  const [viewMode, setViewMode] = useState<ViewMode>('highlight');
  const [shareText, setShareText] = useState('');
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [useCustomCode, setUseCustomCode] = useState(false);
  const [customCode, setCustomCode] = useState('');

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
        body: JSON.stringify({
          text: shareText,
          customCode: useCustomCode ? (customCode.trim() || undefined) : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось поделиться текстом :/');
      }

      const data = await response.json();
      setShareCode(data.code);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B6B', '#4ECDC4', '#C9B1FF', '#FFE66D'],
      });
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
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B6B', '#4ECDC4', '#C9B1FF', '#FFE66D'],
      });
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
            <div className="flex gap-2">
              <button
                onClick={() => setUseCustomCode(false)}
                className={`flex-1 py-2 px-3 font-bold border-4 border-[#1A1A2E] text-sm transition-all ${!useCustomCode
                  ? 'bg-[#FF6B6B] text-[#1A1A2E] shadow-[4px_4px_0px_0px_#1A1A2E]'
                  : 'bg-[#FFFBF0] text-[#1A1A2E] hover:shadow-[4px_4px_0px_0px_#1A1A2E] hover:-translate-x-0.5 hover:-translate-y-0.5'
                  }`}
              >
                Случайный код
              </button>
              <button
                onClick={() => setUseCustomCode(true)}
                className={`flex-1 py-2 px-3 font-bold border-4 border-[#1A1A2E] text-sm transition-all ${useCustomCode
                  ? 'bg-[#FF6B6B] text-[#1A1A2E] shadow-[4px_4px_0px_0px_#1A1A2E]'
                  : 'bg-[#FFFBF0] text-[#1A1A2E] hover:shadow-[4px_4px_0px_0px_#1A1A2E] hover:-translate-x-0.5 hover:-translate-y-0.5'
                  }`}
              >
                Свой код
              </button>
            </div>
            {useCustomCode && (
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="Код (4-10 символов)"
                maxLength={10}
                className="w-full p-4 bg-[#FFFBF0] text-[#1A1A2E] border-4 border-[#1A1A2E] focus:outline-none focus:shadow-[6px_6px_0px_0px_#1A1A2E] transition-shadow font-bold placeholder:text-[#6B6B7B]"
              />
            )}
            <textarea
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              placeholder="Введите ваш текст здесь..."
              className="w-full h-40 p-4 bg-[#FFFBF0] text-[#1A1A2E] border-4 border-[#1A1A2E] resize-none focus:outline-none focus:shadow-[6px_6px_0px_0px_#1A1A2E] transition-shadow font-medium placeholder:text-[#6B6B7B] placeholder:font-normal"
              style={{ fontFamily: 'var(--font-inter), sans-serif' }}
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode(viewMode === 'highlight' ? 'plain' : 'highlight')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#FFFBF0] border-2 border-[#1A1A2E] text-sm font-bold text-[#1A1A2E] hover:shadow-[3px_3px_0px_0px_#1A1A2E] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                    >
                      {viewMode === 'highlight' ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                          <span>Обычный</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                          </svg>
                          <span>Подсветка</span>
                        </>
                      )}
                    </button>
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
                          <span>Копировать</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto bg-[#FFF5D6]">
                  {viewMode === 'highlight' ? (
                    <SyntaxHighlighter
                      language={detectLanguage(getText || '')}
                      style={highlightCustomStyle}
                      customStyle={{
                        margin: 0,
                        padding: '1rem',
                        background: 'transparent',
                        fontSize: '14px',
                        fontFamily: 'var(--font-inter), monospace',
                      }}
                      wrapLines={true}
                      wrapLongLines={true}
                    >
                      {getText || ''}
                    </SyntaxHighlighter>
                  ) : (
                    <pre className="p-4 text-sm text-[#1A1A2E] font-mono whitespace-pre-wrap break-words">
                      {getText || ''}
                    </pre>
                  )}
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
                window.yaContextCb = window.yaContextCb || [];
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
    </main>
  );
}
