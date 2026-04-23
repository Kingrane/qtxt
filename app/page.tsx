// app/page.tsx
'use client';

import { ChangeEvent, useState } from 'react';
import confetti from 'canvas-confetti';
import Script from 'next/script';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

type ViewMode = 'plain' | 'highlight';
type ThemeMode = 'light' | 'mocha';
type InputMode = 'text' | 'file';

const MAX_FILE_BYTES = 20 * 1024;
const GITHUB_URL = 'https://github.com/qtxt/qtxt';

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
    } catch {
      return 'text';
    }
  }
  if (code.includes('def ') || code.includes('import ') || (code.includes('class ') && code.includes(':'))) {
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

const getHighlightStyle = (themeMode: ThemeMode) => {
  const base = themeMode === 'mocha' ? oneDark : oneLight;

  return {
    ...base,
    'pre[class*="language-"]': {
      ...base['pre[class*="language-"]'],
      background: 'transparent',
      margin: 0,
      padding: '1rem',
      fontFamily: 'var(--font-inter), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
    'code[class*="language-"]': {
      ...base['code[class*="language-"]'],
      background: 'transparent',
      fontFamily: 'var(--font-inter), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
  };
};

const readFileAsText = async (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Не удалось прочитать файл как текст'));
      }
    };

    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsText(file);
  });
};

export default function Home() {
  const [mode, setMode] = useState<'share' | 'get'>('share');
  const [viewMode, setViewMode] = useState<ViewMode>('highlight');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [showAbout, setShowAbout] = useState<boolean>(false);

  const [shareText, setShareText] = useState('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
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

  const isMocha = themeMode === 'mocha';

  const colors = {
    pageBg: isMocha ? 'bg-[#11111B]' : 'bg-[#FFF8E1]',
    cardBg: isMocha ? 'bg-[#1E1E2E]' : 'bg-[#FFFBF0]',
    panelBg: isMocha ? 'bg-[#181825]' : 'bg-[#FFFBF0]',
    border: isMocha ? 'border-[#11111B]' : 'border-[#1A1A2E]',
    text: isMocha ? 'text-[#CDD6F4]' : 'text-[#1A1A2E]',
    placeholder: isMocha ? 'placeholder:text-[#A6ADC8]' : 'placeholder:text-[#6B6B7B]',
    share: isMocha ? 'bg-[#F38BA8]' : 'bg-[#FF6B6B]',
    get: isMocha ? 'bg-[#94E2D5]' : 'bg-[#4ECDC4]',
    purple: isMocha ? 'bg-[#CBA6F7]' : 'bg-[#C9B1FF]',
    inputBg: isMocha ? 'bg-[#1E1E2E]' : 'bg-[#FFFBF0]',
    codeBg: isMocha ? 'bg-[#11111B]' : 'bg-[#FFF5D6]',
    buttonBg: isMocha ? 'bg-[#313244]' : 'bg-[#FAF7F2]',
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setShareError('Файл слишком большой. Максимум 20KB.');
      setSelectedFileName('');
      setShareText('');
      event.target.value = '';
      return;
    }

    try {
      const fileText = await readFileAsText(file);
      setShareText(fileText);
      setSelectedFileName(file.name);
      setShareError(null);
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Не удалось прочитать файл');
      setSelectedFileName('');
      setShareText('');
      event.target.value = '';
    }
  };

  const handleShare = async () => {
    if (!shareText.trim()) {
      setShareError(inputMode === 'file' ? 'Сначала выбери файл :P' : 'Текст не может быть пустым :P');
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
          customCode: useCustomCode ? (customCode.trim() || undefined) : undefined,
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
        colors: isMocha ? ['#F38BA8', '#94E2D5', '#CBA6F7', '#F9E2AF'] : ['#FF6B6B', '#4ECDC4', '#C9B1FF', '#FFE66D'],
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
      const response = await fetch(`/api/get?code=${encodeURIComponent(getCode)}`);

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
        colors: isMocha ? ['#F38BA8', '#94E2D5', '#CBA6F7', '#F9E2AF'] : ['#FF6B6B', '#4ECDC4', '#C9B1FF', '#FFE66D'],
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
    <main className={`flex min-h-screen flex-col items-center justify-center p-4 pt-20 sm:pt-24 relative ${colors.pageBg}`}>
      <header className="fixed left-1/2 top-3 z-40 -translate-x-1/2">
        <div
          className={`flex items-center gap-1 rounded-sm p-1 border-4 ${colors.border} ${colors.panelBg} shadow-[6px_6px_0px_0px_var(--shadow-color)] max-w-[calc(100vw-16px)]`}
          style={{ ['--shadow-color' as string]: isMocha ? '#11111B' : '#1A1A2E' }}
        >
          <button
            onClick={() => setInputMode('text')}
            title="Текст"
            aria-label="Режим текста"
            className={`inline-flex h-8 w-8 items-center justify-center font-black border-2 ${colors.border} transition-all sm:h-9 sm:w-9 ${inputMode === 'text' ? `${colors.share} ${isMocha ? 'text-[#11111B]' : 'text-[#1A1A2E]'} shadow-[2px_2px_0px_0px_var(--shadow-color)]` : `${colors.panelBg} ${colors.text} hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5`}`}
            style={{ ['--shadow-color' as string]: isMocha ? '#11111B' : '#1A1A2E' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
            </svg>
          </button>
          <button
            onClick={() => setInputMode('file')}
            title="Файлы"
            aria-label="Режим файлов"
            className={`inline-flex h-8 w-8 items-center justify-center font-black border-2 ${colors.border} transition-all sm:h-9 sm:w-9 ${inputMode === 'file' ? `${colors.get} text-[#11111B] shadow-[2px_2px_0px_0px_var(--shadow-color)]` : `${colors.panelBg} ${colors.text} hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5`}`}
            style={{ ['--shadow-color' as string]: isMocha ? '#11111B' : '#1A1A2E' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          </button>
          <button
            onClick={() => setThemeMode((currentTheme) => currentTheme === 'light' ? 'mocha' : 'light')}
            title={isMocha ? 'Светлая тема' : 'Темная тема'}
            aria-label={isMocha ? 'Включить светлую тему' : 'Включить темную тему'}
            className={`inline-flex h-8 w-8 items-center justify-center font-black border-2 ${colors.border} transition-all sm:h-9 sm:w-9 ${colors.purple} text-[#11111B] hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5`}
            style={{ ['--shadow-color' as string]: isMocha ? '#11111B' : '#1A1A2E' }}
          >
            {isMocha ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36 6.36l-1.41-1.41M7.05 7.05L5.64 5.64m12.72 0l-1.41 1.41M7.05 16.95l-1.41 1.41M12 16a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setShowAbout(true)}
            title="Инфо"
            aria-label="О сервисе"
            className={`inline-flex h-8 w-8 items-center justify-center font-black border-2 ${colors.border} transition-all sm:h-9 sm:w-9 ${colors.panelBg} ${colors.text} hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5`}
            style={{ ['--shadow-color' as string]: isMocha ? '#11111B' : '#1A1A2E' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4M12 8h.01M22 12a10 10 0 11-20 0 10 10 0 0120 0z" />
            </svg>
          </button>
        </div>
      </header>

      <div className={`w-full max-w-lg p-8 space-y-6 ${colors.cardBg} border-4 ${colors.border} shadow-[8px_8px_0px_0px_var(--shadow-color)]`} style={{ ['--shadow-color' as string]: isMocha ? '#11111B' : '#1A1A2E' }}>
        <h1 className={`text-4xl font-black text-center uppercase tracking-tight ${colors.text}`}>
          qtxt
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => setMode('share')}
            className={`flex-1 py-3 px-4 font-bold border-4 ${colors.border} tracking-wide transition-all ${mode === 'share'
              ? `${colors.share} text-[#11111B] shadow-[4px_4px_0px_0px_var(--shadow-color)]`
              : `${colors.cardBg} ${colors.text} hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-x-1 hover:-translate-y-1`
              }`}
            style={{ ['--shadow-color' as string]: isMocha ? '#11111B' : '#1A1A2E' }}
          >
            Поделиться
          </button>
          <button
            onClick={() => setMode('get')}
            className={`flex-1 py-3 px-4 font-bold border-4 ${colors.border} tracking-wide transition-all ${mode === 'get'
              ? `${colors.get} text-[#11111B] shadow-[4px_4px_0px_0px_var(--shadow-color)]`
              : `${colors.cardBg} ${colors.text} hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-x-1 hover:-translate-y-1`
              }`}
            style={{ ['--shadow-color' as string]: isMocha ? '#11111B' : '#1A1A2E' }}
          >
            Получить
          </button>
        </div>

        {mode === 'share' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setUseCustomCode(false)}
                className={`flex-1 py-2 px-3 font-bold border-4 ${colors.border} text-sm transition-all ${!useCustomCode
                  ? `${colors.share} text-[#11111B] shadow-[4px_4px_0px_0px_var(--shadow-color)]`
                  : `${colors.cardBg} ${colors.text} hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5`
                  }`}
                style={{ ['--shadow-color' as string]: isMocha ? '#11111B' : '#1A1A2E' }}
              >
                Случайный код
              </button>
              <button
                onClick={() => setUseCustomCode(true)}
                className={`flex-1 py-2 px-3 font-bold border-4 ${colors.border} text-sm transition-all ${useCustomCode
                  ? `${colors.share} text-[#11111B] shadow-[4px_4px_0px_0px_var(--shadow-color)]`
                  : `${colors.cardBg} ${colors.text} hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5`
                  }`}
                style={{ ['--shadow-color' as string]: isMocha ? '#11111B' : '#1A1A2E' }}
              >
                Свой код
              </button>
            </div>

            {useCustomCode && (
              <input
                type="text"
                value={customCode}
                onChange={(event) => setCustomCode(event.target.value)}
                placeholder="Код (4-10 символов)"
                maxLength={10}
                className={`w-full p-4 ${colors.inputBg} ${colors.text} border-4 ${colors.border} focus:outline-none focus:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-shadow font-bold ${colors.placeholder}`}
                style={{ ['--shadow-color' as string]: isMocha ? '#11111B' : '#1A1A2E' }}
              />
            )}

            {inputMode === 'text' ? (
              <textarea
                value={shareText}
                onChange={(event) => setShareText(event.target.value)}
                placeholder="Введите ваш текст здесь..."
                className={`w-full h-40 p-4 ${colors.inputBg} ${colors.text} border-4 ${colors.border} resize-none focus:outline-none focus:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-shadow font-medium ${colors.placeholder} placeholder:font-normal`}
                style={{
                  ['--shadow-color' as string]: isMocha ? '#11111B' : '#1A1A2E',
                  fontFamily: 'var(--font-inter), sans-serif',
                }}
              />
            ) : (
              <div className={`p-4 ${colors.inputBg} border-4 border-dashed ${colors.border}`}>
                <label className={`block text-sm font-bold ${colors.text}`}>
                  Выбери текстовый файл (до 20KB)
                </label>
                <input type="file" onChange={handleFileChange} className={`mt-3 w-full text-sm ${colors.text}`} />
                {selectedFileName && (
                  <p className={`mt-3 text-sm font-bold ${colors.text}`}>Файл: {selectedFileName}</p>
                )}
              </div>
            )}

            <button
              onClick={handleShare}
              disabled={shareLoading}
              className={`w-full py-4 px-6 ${colors.share} text-[#11111B] font-black text-lg uppercase border-4 ${colors.border} shadow-[6px_6px_0px_0px_var(--shadow-color)] hover:shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:-translate-x-1 hover:-translate-y-1 disabled:bg-[#7f849c] disabled:cursor-not-allowed disabled:transform-none transition-all active:shadow-[2px_2px_0px_0px_var(--shadow-color)] active:translate-x-1 active:translate-y-1`}
              style={{ ['--shadow-color' as string]: isMocha ? '#11111B' : '#1A1A2E' }}
            >
              {shareLoading ? 'Создание ссылки...' : 'Поделиться'}
            </button>

            {shareError && (
              <div className={`p-4 ${isMocha ? 'bg-[#EBA0AC]' : 'bg-[#FF6B6B]'} border-4 ${colors.border} text-center`}>
                <p className="font-bold text-[#11111B]">{shareError}</p>
              </div>
            )}

            {shareCode && (
              <div className={`p-6 ${colors.purple} border-4 ${colors.border} shadow-[6px_6px_0px_0px_var(--shadow-color)]`} style={{ ['--shadow-color' as string]: isMocha ? '#11111B' : '#1A1A2E' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#11111B] mb-2 uppercase tracking-wider">Ваш код</p>
                    <p className="text-3xl font-black text-[#11111B] break-all" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                      {shareCode}
                    </p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`p-3 ${colors.buttonBg} border-4 ${colors.border} hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-x-1 hover:-translate-y-1 transition-all active:shadow-[1px_1px_0px_0px_var(--shadow-color)] active:translate-x-1 active:translate-y-1`}
                    style={{ ['--shadow-color' as string]: isMocha ? '#11111B' : '#1A1A2E' }}
                  >
                    {copied ? (
                      <span className="text-sm font-bold text-[#11111B]">OK</span>
                    ) : (
                      <span className="text-sm font-bold text-[#11111B]">Копировать</span>
                    )}
                  </button>
                </div>
                <p className="text-xs font-bold text-[#11111B] mt-4 opacity-80">
                  Текст будет удален через 10 минут.
                </p>
              </div>
            )}
          </div>
        )}

        {mode === 'get' && (
          <div className="space-y-4">
            <input
              type="text"
              value={getCode}
              onChange={(event) => setGetCode(event.target.value)}
              placeholder="Введите код для получения текста"
              className={`w-full p-4 ${colors.inputBg} ${colors.text} border-4 ${colors.border} focus:outline-none focus:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-shadow font-bold text-lg ${colors.placeholder} placeholder:normal-case placeholder:font-normal placeholder:text-base`}
              style={{ ['--shadow-color' as string]: isMocha ? '#11111B' : '#1A1A2E' }}
            />
            <button
              onClick={handleGet}
              disabled={getLoading}
              className={`w-full py-4 px-6 ${colors.get} text-[#11111B] font-black text-lg uppercase border-4 ${colors.border} shadow-[6px_6px_0px_0px_var(--shadow-color)] hover:shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:-translate-x-1 hover:-translate-y-1 disabled:bg-[#7f849c] disabled:cursor-not-allowed disabled:transform-none transition-all active:shadow-[2px_2px_0px_0px_var(--shadow-color)] active:translate-x-1 active:translate-y-1`}
              style={{ ['--shadow-color' as string]: isMocha ? '#11111B' : '#1A1A2E' }}
            >
              {getLoading ? 'Загрузка...' : 'Получить текст'}
            </button>
            {getError && (
              <div className={`p-4 ${isMocha ? 'bg-[#EBA0AC]' : 'bg-[#FF6B6B]'} border-4 ${colors.border} text-center`}>
                <p className="font-bold text-[#11111B]">{getError}</p>
              </div>
            )}
            {getText && (
              <div className={`${colors.inputBg} border-4 ${colors.border} shadow-[6px_6px_0px_0px_var(--shadow-color)]`} style={{ ['--shadow-color' as string]: isMocha ? '#11111B' : '#1A1A2E' }}>
                <div className={`flex items-center justify-between px-4 py-3 ${colors.get} border-b-4 ${colors.border}`}>
                  <p className="text-sm font-bold text-[#11111B] uppercase tracking-wider">Ваш текст</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode(viewMode === 'highlight' ? 'plain' : 'highlight')}
                      className={`flex items-center gap-1 px-3 py-1.5 ${colors.buttonBg} border-2 ${colors.border} text-sm font-bold text-[#11111B] hover:shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all`}
                      style={{ ['--shadow-color' as string]: isMocha ? '#11111B' : '#1A1A2E' }}
                    >
                      <span>{viewMode === 'highlight' ? 'Обычный' : 'Подсветка'}</span>
                    </button>
                    <button
                      onClick={handleCopyText}
                      className={`flex items-center gap-2 px-3 py-1.5 ${colors.buttonBg} border-2 ${colors.border} text-sm font-bold text-[#11111B] hover:shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all`}
                      style={{ ['--shadow-color' as string]: isMocha ? '#11111B' : '#1A1A2E' }}
                    >
                      <span>{textCopied ? 'Скопировано!' : 'Копировать'}</span>
                    </button>
                  </div>
                </div>
                <div className={`max-h-60 overflow-y-auto ${colors.codeBg}`}>
                  {viewMode === 'highlight' ? (
                    <SyntaxHighlighter
                      language={detectLanguage(getText || '')}
                      style={getHighlightStyle(themeMode)}
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
                    <pre className={`p-4 text-sm ${colors.text} font-mono whitespace-pre-wrap break-words`}>
                      {getText || ''}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 w-full max-w-lg">
        <Script
          id="yandex-floor-ad-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.yaContextCb = window.yaContextCb || [];
              window.yaContextCb.push(() => {
                Ya.Context.AdvManager.render({
                  blockId: 'R-A-17962443-2',
                  type: 'floorAd',
                  platform: 'desktop'
                });
              });
            `,
          }}
        />
      </div>

      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-md p-6 ${colors.cardBg} border-4 ${colors.border} shadow-[8px_8px_0px_0px_var(--shadow-color)]`} style={{ ['--shadow-color' as string]: isMocha ? '#11111B' : '#1A1A2E' }}>
            <h2 className={`text-2xl font-black uppercase ${colors.text}`}>О сервисе</h2>
            <p className={`mt-3 text-sm font-medium ${colors.text}`}>
              qtxt - анонимный обменник текстом и маленькими файлами по короткому коду.
            </p>
            <p className={`mt-2 text-sm font-medium ${colors.text}`}>
              Данные хранятся временно и автоматически удаляются через 10 минут.
            </p>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className={`mt-4 inline-block py-2 px-4 font-bold border-4 ${colors.border} ${colors.get} text-[#11111B] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all`}
              style={{ ['--shadow-color' as string]: isMocha ? '#11111B' : '#1A1A2E' }}
            >
              GitHub
            </a>
            <button
              onClick={() => setShowAbout(false)}
              className={`mt-4 w-full py-3 px-4 font-black uppercase border-4 ${colors.border} ${colors.share} text-[#11111B] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all`}
              style={{ ['--shadow-color' as string]: isMocha ? '#11111B' : '#1A1A2E' }}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
