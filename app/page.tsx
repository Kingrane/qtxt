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
      setTimeout(() => setCopied(false), 2000); // Сбросить статус через 2 сек
    }
  };

  return (
    // УСИЛЕННЫЙ ДИЗАЙН: более сложный градиент и анимация появления
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 animate-fade-in">
      {/* УСИЛЕННЫЙ ДИЗАЙН: сильнее blur, сложнее бордеры, тень, анимация наведения */}
      <div className="w-full max-w-lg p-8 space-y-8 bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 hover:shadow-purple-500/20 transition-all duration-500 ease-in-out">
        <h1 className="text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-unbounded">
          TextEx
        </h1>
        
        <div className="flex justify-center p-1 bg-white/5 rounded-xl border border-white/10">
          <button
            onClick={() => setMode('share')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
              mode === 'share' ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Поделиться
          </button>
          <button
            onClick={() => setMode('get')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
              mode === 'get' ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Получить
          </button>
        </div>

        {mode === 'share' && (
          <div className="space-y-5 transition-all duration-500 ease-in-out">
            <textarea
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              placeholder="Введите ваш текст здесь..."
              className="w-full h-40 p-4 bg-white/5 border border-white/10 rounded-xl resize-none placeholder:text-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            />
            <button
              onClick={handleShare}
              disabled={shareLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 transition-all duration-300 transform hover:scale-105"
            >
              {shareLoading ? 'Создание ссылки...' : 'Поделиться'}
            </button>
            {shareError && <p className="text-center text-red-400 font-medium">{shareError}</p>}
            {shareCode && (
              <div className="p-5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-xl text-center space-y-3">
                <p className="text-sm text-gray-300 font-unbounded">ВАШ КОД:</p>
                <div className="flex items-center justify-center gap-3">
                  <p className="text-3xl font-mono font-bold text-cyan-400">{shareCode}</p>
                  <button onClick={handleCopy} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    {copied ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-400">Текст будет удален через 10 минут.</p>
              </div>
            )}
          </div>
        )}

        {mode === 'get' && (
          <div className="space-y-5 transition-all duration-500 ease-in-out">
            <input
              type="text"
              value={getCode}
              onChange={(e) => setGetCode(e.target.value)}
              placeholder="Введите код для получения текста :)"
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl placeholder:text-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
            />
            <button
              onClick={handleGet}
              disabled={getLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 transition-all duration-300 transform hover:scale-105"
            >
              {getLoading ? 'Загрузка...' : 'Получить текст'}
            </button>
            {getError && <p className="text-center text-red-400 font-medium">{getError}</p>}
            {getText && (
              <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-sm text-gray-300 mb-3 font-unbounded">ВАШ ТЕКСТ:</p>
                <p className="whitespace-pre-wrap text-white font-inter">{getText}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
