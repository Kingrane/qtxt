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

  const palette = {
    pageBg: isMocha ? 'bg-[#11111b]' : 'bg-[#f8f4e8]',
    panelBg: isMocha ? 'bg-[#1e1e2e]/95' : 'bg-[#fff8ea]/95',
    cardBg: isMocha ? 'bg-[#1e1e2e]' : 'bg-[#fffaf0]',
    softBg: isMocha ? 'bg-[#181825]' : 'bg-[#fdf3dd]',
    border: isMocha ? 'border-[#313244]' : 'border-[#1f2335]',
    hardBorder: isMocha ? 'border-[#45475a]' : 'border-[#1f2335]',
    text: isMocha ? 'text-[#cdd6f4]' : 'text-[#1f2335]',
    textSoft: isMocha ? 'text-[#a6adc8]' : 'text-[#5f6173]',
    accentShare: isMocha ? 'bg-[#f38ba8]' : 'bg-[#ff6b6b]',
    accentGet: isMocha ? 'bg-[#94e2d5]' : 'bg-[#4ecdc4]',
    accentAlt: isMocha ? 'bg-[#cba6f7]' : 'bg-[#c9b1ff]',
    shadow: isMocha ? '#0b0b12' : '#1f2335',
    inputBg: isMocha ? 'bg-[#181825]' : 'bg-[#fff8ea]',
    codeBg: isMocha ? 'bg-[#11111b]' : 'bg-[#fff1cd]',
    okText: 'text-[#11111b]',
    error: isMocha ? 'bg-[#f2a7b8]' : 'bg-[#ff7f7f]',
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
        particleCount: 110,
        spread: 68,
        origin: { y: 0.64 },
        colors: isMocha ? ['#f38ba8', '#94e2d5', '#cba6f7', '#f9e2af'] : ['#ff6b6b', '#4ecdc4', '#c9b1ff', '#ffe66d'],
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
        particleCount: 110,
        spread: 68,
        origin: { y: 0.64 },
        colors: isMocha ? ['#f38ba8', '#94e2d5', '#cba6f7', '#f9e2af'] : ['#ff6b6b', '#4ecdc4', '#c9b1ff', '#ffe66d'],
      });
    } catch (error) {
      setGetError(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setGetLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shareCode) return;
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyText = () => {
    if (!getText) return;
    navigator.clipboard.writeText(getText);
    setTextCopied(true);
    setTimeout(() => setTextCopied(false), 2000);
  };

  return (
    <main className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4 pt-24 sm:pt-28 ${palette.pageBg}`}>
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute -left-16 top-10 h-56 w-56 rounded-full blur-3xl ${isMocha ? 'bg-[#94e2d54d]' : 'bg-[#4ecdc44d]'}`} />
        <div className={`absolute -right-20 bottom-12 h-64 w-64 rounded-full blur-3xl ${isMocha ? 'bg-[#cba6f74d]' : 'bg-[#c9b1ff4d]'}`} />
        <div className={`absolute left-1/2 top-1/3 h-36 w-36 -translate-x-1/2 rounded-full blur-2xl ${isMocha ? 'bg-[#f9e2af33]' : 'bg-[#ffe66d40]'}`} />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.08) 1px, transparent 0)',
            backgroundSize: '12px 12px',
          }}
        />
      </div>

      <header className="fixed left-1/2 top-3 z-40 -translate-x-1/2">
        <div
          className={`flex items-center gap-1 rounded-xl border-2 p-1 backdrop-blur ${palette.panelBg} ${palette.border} shadow-[0_8px_18px_0_var(--shadow-color)]`}
          style={{ ['--shadow-color' as string]: `${palette.shadow}66` }}
        >
          <button
            onClick={() => setInputMode('text')}
            title="Текст"
            aria-label="Режим текста"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border-2 transition-all active:scale-95 ${palette.hardBorder} ${inputMode === 'text' ? `${palette.accentShare} ${palette.okText} shadow-[2px_2px_0px_0px_var(--shadow-color)]` : `${palette.softBg} ${palette.text} hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--shadow-color)]`}`}
            style={{ ['--shadow-color' as string]: palette.shadow }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
            </svg>
          </button>
          <button
            onClick={() => setInputMode('file')}
            title="Файлы"
            aria-label="Режим файлов"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border-2 transition-all active:scale-95 ${palette.hardBorder} ${inputMode === 'file' ? `${palette.accentGet} ${palette.okText} shadow-[2px_2px_0px_0px_var(--shadow-color)]` : `${palette.softBg} ${palette.text} hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--shadow-color)]`}`}
            style={{ ['--shadow-color' as string]: palette.shadow }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          </button>
          <button
            onClick={() => setThemeMode((currentTheme) => currentTheme === 'light' ? 'mocha' : 'light')}
            title={isMocha ? 'Светлая тема' : 'Темная тема'}
            aria-label={isMocha ? 'Включить светлую тему' : 'Включить темную тему'}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border-2 transition-all active:scale-95 ${palette.hardBorder} ${palette.accentAlt} ${palette.okText} hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--shadow-color)]`}
            style={{ ['--shadow-color' as string]: palette.shadow }}
          >
            {isMocha ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36 6.36l-1.41-1.41M7.05 7.05L5.64 5.64m12.72 0l-1.41 1.41M7.05 16.95l-1.41 1.41M12 16a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setShowAbout(true)}
            title="Инфо"
            aria-label="О сервисе"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border-2 transition-all active:scale-95 ${palette.hardBorder} ${palette.softBg} ${palette.text} hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--shadow-color)]`}
            style={{ ['--shadow-color' as string]: palette.shadow }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4M12 8h.01M22 12a10 10 0 11-20 0 10 10 0 0120 0z" />
            </svg>
          </button>
        </div>
      </header>

      <section
        className={`relative w-full max-w-xl rounded-[1.6rem] border-2 p-5 transition-transform duration-300 hover:-translate-y-0.5 sm:p-8 ${palette.border} ${palette.cardBg} shadow-[0_18px_40px_0_var(--shadow-color)]`}
        style={{ ['--shadow-color' as string]: `${palette.shadow}99` }}
      >
        <h1 className={`text-center text-4xl font-black uppercase tracking-tight sm:text-5xl ${palette.text}`}>qtxt</h1>
        <p className={`mt-2 text-center text-sm font-semibold ${palette.textSoft}`}>ввел код -&gt; получил текст</p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setMode('share')}
            className={`flex-1 rounded-xl border-2 px-3 py-3 text-base font-black tracking-wide transition-all ${palette.hardBorder} ${mode === 'share' ? `${palette.accentShare} ${palette.okText} shadow-[3px_3px_0px_0px_var(--shadow-color)]` : `${palette.softBg} ${palette.text} hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--shadow-color)]`}`}
            style={{ ['--shadow-color' as string]: palette.shadow }}
          >
            Поделиться
          </button>
          <button
            onClick={() => setMode('get')}
            className={`flex-1 rounded-xl border-2 px-3 py-3 text-base font-black tracking-wide transition-all ${palette.hardBorder} ${mode === 'get' ? `${palette.accentGet} ${palette.okText} shadow-[3px_3px_0px_0px_var(--shadow-color)]` : `${palette.softBg} ${palette.text} hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--shadow-color)]`}`}
            style={{ ['--shadow-color' as string]: palette.shadow }}
          >
            Получить
          </button>
        </div>

        {mode === 'share' && (
          <div className="mt-5 space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setUseCustomCode(false)}
                className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-bold transition-all ${palette.hardBorder} ${!useCustomCode ? `${palette.accentShare} ${palette.okText} shadow-[2px_2px_0px_0px_var(--shadow-color)]` : `${palette.softBg} ${palette.text} hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--shadow-color)]`}`}
                style={{ ['--shadow-color' as string]: palette.shadow }}
              >
                Случайный код
              </button>
              <button
                onClick={() => setUseCustomCode(true)}
                className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-bold transition-all ${palette.hardBorder} ${useCustomCode ? `${palette.accentShare} ${palette.okText} shadow-[2px_2px_0px_0px_var(--shadow-color)]` : `${palette.softBg} ${palette.text} hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--shadow-color)]`}`}
                style={{ ['--shadow-color' as string]: palette.shadow }}
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
                className={`w-full rounded-lg border-2 p-4 text-base font-bold outline-none transition-all ${palette.inputBg} ${palette.text} ${palette.hardBorder} placeholder:font-medium placeholder:${isMocha ? '[#8f95b2]' : '[#71768f]'} focus:-translate-y-0.5 focus:shadow-[4px_4px_0px_0px_var(--shadow-color)]`}
                style={{ ['--shadow-color' as string]: palette.shadow }}
              />
            )}

            {inputMode === 'text' ? (
              <textarea
                value={shareText}
                onChange={(event) => setShareText(event.target.value)}
                placeholder="Введите ваш текст здесь..."
                className={`h-44 w-full resize-none rounded-lg border-2 p-4 text-sm font-medium outline-none transition-all ${palette.inputBg} ${palette.text} ${palette.hardBorder} placeholder:font-normal placeholder:${isMocha ? '[#8f95b2]' : '[#71768f]'} focus:-translate-y-0.5 focus:shadow-[4px_4px_0px_0px_var(--shadow-color)]`}
                style={{
                  ['--shadow-color' as string]: palette.shadow,
                  fontFamily: 'var(--font-inter), sans-serif',
                }}
              />
            ) : (
              <div className={`rounded-lg border-2 border-dashed p-4 ${palette.hardBorder} ${palette.inputBg}`}>
                <label className={`block text-sm font-bold ${palette.text}`}>Выбери текстовый файл (до 20KB)</label>
                <input type="file" onChange={handleFileChange} className={`mt-3 w-full text-sm ${palette.text}`} />
                {selectedFileName && <p className={`mt-3 text-sm font-bold ${palette.text}`}>Файл: {selectedFileName}</p>}
              </div>
            )}

            <button
              onClick={handleShare}
              disabled={shareLoading}
              className={`w-full rounded-xl border-2 px-5 py-4 text-xl font-black uppercase tracking-wide transition-all ${palette.accentShare} ${palette.okText} ${palette.hardBorder} shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none`}
              style={{ ['--shadow-color' as string]: palette.shadow }}
            >
              {shareLoading ? 'Создание ссылки...' : 'Поделиться'}
            </button>

            {shareError && (
              <div className={`rounded-lg border-2 p-3 text-center ${palette.error} ${palette.hardBorder}`}>
                <p className="text-sm font-bold text-[#11111b]">{shareError}</p>
              </div>
            )}

            {shareCode && (
              <div
                className={`rounded-xl border-2 p-5 ${palette.accentAlt} ${palette.hardBorder} shadow-[4px_4px_0px_0px_var(--shadow-color)]`}
                style={{ ['--shadow-color' as string]: palette.shadow }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#11111b]">Ваш код</p>
                    <p className="break-all text-3xl font-black text-[#11111b]" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                      {shareCode}
                    </p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`rounded-lg border-2 px-3 py-2 text-sm font-black transition-all ${palette.softBg} ${palette.hardBorder} text-[#11111b] hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--shadow-color)]`}
                    style={{ ['--shadow-color' as string]: palette.shadow }}
                  >
                    {copied ? 'OK' : 'Копировать'}
                  </button>
                </div>
                <p className="mt-4 text-xs font-bold tracking-wider text-[#11111b] opacity-80">Текст будет удален через 10 минут.</p>
              </div>
            )}
          </div>
        )}

        {mode === 'get' && (
          <div className="mt-5 space-y-4">
            <input
              type="text"
              value={getCode}
              onChange={(event) => setGetCode(event.target.value)}
              placeholder="Введите код для получения текста"
              className={`w-full rounded-lg border-2 p-4 text-lg font-bold outline-none transition-all ${palette.inputBg} ${palette.text} ${palette.hardBorder} placeholder:font-normal placeholder:${isMocha ? '[#8f95b2]' : '[#71768f]'} focus:-translate-y-0.5 focus:shadow-[4px_4px_0px_0px_var(--shadow-color)]`}
              style={{ ['--shadow-color' as string]: palette.shadow }}
            />
            <button
              onClick={handleGet}
              disabled={getLoading}
              className={`w-full rounded-xl border-2 px-5 py-4 text-xl font-black uppercase tracking-wide transition-all ${palette.accentGet} ${palette.okText} ${palette.hardBorder} shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none`}
              style={{ ['--shadow-color' as string]: palette.shadow }}
            >
              {getLoading ? 'Загрузка...' : 'Получить текст'}
            </button>

            {getError && (
              <div className={`rounded-lg border-2 p-3 text-center ${palette.error} ${palette.hardBorder}`}>
                <p className="text-sm font-bold text-[#11111b]">{getError}</p>
              </div>
            )}

            {getText && (
              <div
                className={`overflow-hidden rounded-xl border-2 ${palette.inputBg} ${palette.hardBorder} shadow-[4px_4px_0px_0px_var(--shadow-color)]`}
                style={{ ['--shadow-color' as string]: palette.shadow }}
              >
                <div className={`flex flex-wrap items-center justify-between gap-2 border-b-2 px-4 py-3 ${palette.accentGet} ${palette.hardBorder}`}>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[#11111b]">Ваш текст</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode(viewMode === 'highlight' ? 'plain' : 'highlight')}
                      className={`rounded-lg border-2 px-3 py-1.5 text-sm font-bold text-[#11111b] transition-all ${palette.softBg} ${palette.hardBorder} hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--shadow-color)]`}
                      style={{ ['--shadow-color' as string]: palette.shadow }}
                    >
                      {viewMode === 'highlight' ? 'Обычный' : 'Подсветка'}
                    </button>
                    <button
                      onClick={handleCopyText}
                      className={`rounded-lg border-2 px-3 py-1.5 text-sm font-bold text-[#11111b] transition-all ${palette.softBg} ${palette.hardBorder} hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--shadow-color)]`}
                      style={{ ['--shadow-color' as string]: palette.shadow }}
                    >
                      {textCopied ? 'Скопировано!' : 'Копировать'}
                    </button>
                  </div>
                </div>
                <div className={`max-h-64 overflow-y-auto ${palette.codeBg}`}>
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
                    <pre className={`p-4 text-sm ${palette.text} whitespace-pre-wrap break-words`}>
                      {getText || ''}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-2xl border-2 p-6 ${palette.cardBg} ${palette.hardBorder} shadow-[0_18px_36px_0_var(--shadow-color)]`}
            style={{ ['--shadow-color' as string]: `${palette.shadow}aa` }}
          >
            <h2 className={`text-2xl font-black uppercase ${palette.text}`}>О сервисе</h2>
            <p className={`mt-3 text-sm font-medium leading-relaxed ${palette.text}`}>
              qtxt - анонимный обменник текстом и небольшими файлами по короткому коду.
            </p>
            <p className={`mt-2 text-sm font-medium leading-relaxed ${palette.text}`}>
              Всё хранится временно и автоматически удаляется через 10 минут.
            </p>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className={`mt-4 inline-block rounded-lg border-2 px-4 py-2 text-sm font-bold transition-all ${palette.accentGet} ${palette.okText} ${palette.hardBorder} shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:-translate-y-0.5`}
              style={{ ['--shadow-color' as string]: palette.shadow }}
            >
              GitHub
            </a>
            <button
              onClick={() => setShowAbout(false)}
              className={`mt-4 w-full rounded-xl border-2 px-4 py-3 text-sm font-black uppercase transition-all ${palette.accentShare} ${palette.okText} ${palette.hardBorder} shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:-translate-y-0.5`}
              style={{ ['--shadow-color' as string]: palette.shadow }}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
