// app/page.tsx
'use client';

import { useState } from 'react';

export default function Home() {
  const [mode, setMode] = useState<'share' | 'get'>('share');
  const [shareText, setShareText] = useState('');
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [getCode, setGetCode] = useState('');
  const [getText, setGetText] = useState<string | null>(null);
  const [getLoading, setGetLoading] = useState(false);
  const [getError, setGetError] = useState<string | null>(null);

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
    } catch (error: any) {
      setShareError(error.message);
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
    } catch (error: any) {
      setGetError(error.message);
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

  return (
    // МИНИМАЛИЗМ: Темно-серый фон, без градиентов
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900">
      {/* МИНИМАЛИЗМ: Простая карточка с четкой границей */}
      <div className="w-full max-w-lg p-8 space-y-8 bg-gray-800 rounded-lg border border-gray-700">
        {/* МИНИМАЛИЗМ: Заголовок с одним акцентным цветом */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-thin text-white">qtxt</h1>
          <span className="text-xs font-medium text-cyan-500">privet</span>
        </div>
        
        {/* МИНИМАЛИЗМ: Переключатель из двух кнопок без фона */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setMode('share')}
            className={`pb-1 font-medium transition-colors border-b-2 ${
              mode === 'share' ? 'text-cyan-500 border-cyan-500' : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            Поделиться
          </button>
          <button
            onClick={() => setMode('get')}
            className={`pb-1 font-medium transition-colors border-b-2 ${
              mode === 'get' ? 'text-cyan-500 border-cyan-500' : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            Получить
          </button>
        </div>

        {mode === 'share' && (
          <div className="space-y-6">
            <textarea
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              placeholder="Введите ваш текст здесь..."
              // МИНИМАЛИЗМ: Строгие поля ввода
              className="w-full h-40 p-3 bg-gray-900 border border-gray-700 rounded-md resize-none placeholder-gray-500 text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              onClick={handleShare}
              disabled={shareLoading}
              // МИНИМАЛИЗМ: Простая кнопка с акцентным цветом
              className="w-full py-3 px-4 bg-cyan-500 text-gray-900 font-semibold rounded-md hover:bg-cyan-400 disabled:bg-gray-600 disabled:text-gray-400 transition-colors"
            >
              {shareLoading ? 'Создание ссылки...' : 'Поделиться'}
            </button>
            {shareError && <p className="text-center text-red-500 text-sm">{shareError}</p>}
            {shareCode && (
              // МИНИМАЛИЗМ: Блок с результатом с левой цветной полосой
              <div className="p-4 bg-gray-900 rounded-md border-l-4 border-cyan-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Ваш код</p>
                    <p className="text-2xl font-mono font-bold text-white mt-1">{shareCode}</p>
                  </div>
                  <button onClick={handleCopy} className="p-2 text-gray-400 hover:text-white transition-colors">
                    {copied ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3">Текст будет удален через 10 минут.</p>
              </div>
            )}
          </div>
        )}

        {mode === 'get' && (
          <div className="space-y-6">
            <input
              type="text"
              value={getCode}
              onChange={(e) => setGetCode(e.target.value)}
              placeholder="Введите код для получения текста"
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md placeholder-gray-500 text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              onClick={handleGet}
              disabled={getLoading}
              className="w-full py-3 px-4 bg-cyan-500 text-gray-900 font-semibold rounded-md hover:bg-cyan-400 disabled:bg-gray-600 disabled:text-gray-400 transition-colors"
            >
              {getLoading ? 'Загрузка...' : 'Получить текст'}
            </button>
            {getError && <p className="text-center text-red-500 text-sm">{getError}</p>}
            {getText && (
              <div className="p-4 bg-gray-900 rounded-md border-l-4 border-cyan-500">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Ваш текст</p>
                <p className="text-white mt-2 whitespace-pre-wrap">{getText}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
