// app/page.tsx
'use client';

import { useState } from 'react';

export default function Home() {
  const [mode, setMode] = useState<'share' | 'get'>('share');
  const [shareText, setShareText] = useState('');
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const [getCode, setGetCode] = useState('');
  const [getText, setGetText] = useState<string | null>(null);
  const [getLoading, setGetLoading] = useState(false);
  const [getError, setGetError] = useState<string | null>(null);

  const handleShare = async () => {
    if (!shareText.trim()) {
      setShareError('Текст не может быть пустым');
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
        throw new Error('Не удалось поделиться текстом');
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
      setGetError('Код не может быть пустым');
      return;
    }
    setGetLoading(true);
    setGetError(null);
    setGetText(null);

    try {
      const response = await fetch(`/api/get?code=${getCode}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Текст не найден или устарел');
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

  return (
    // НОВЫЙ ДИЗАЙН: темный фон с градиентом
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* НОВЫЙ ДИЗАЙН: карточка с эффектом стекла */}
      <div className="w-full max-w-lg p-8 space-y-6 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
        <h1 className="text-4xl font-bold text-center text-white">Обменник текстом</h1>
        
        <div className="flex justify-center p-1 bg-white/10 rounded-lg">
          <button
            onClick={() => setMode('share')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              mode === 'share' ? 'bg-white/20 text-white shadow-sm' : 'text-gray-300'
            }`}
          >
            Поделиться
          </button>
          <button
            onClick={() => setMode('get')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              mode === 'get' ? 'bg-white/20 text-white shadow-sm' : 'text-gray-300'
            }`}
          >
            Получить
          </button>
        </div>

        {mode === 'share' && (
          <div className="space-y-4">
            <textarea
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              placeholder="Введите ваш текст здесь..."
              // ИСПРАВЛЕНИЕ: явно задаем цвет текста и фона
              className="w-full h-40 p-3 bg-white/20 border border-white/30 rounded-lg resize-none placeholder:text-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleShare}
              disabled={shareLoading}
              // НОВЫЙ ДИЗАЙН: кнопка с градиентом
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 transition-all"
            >
              {shareLoading ? 'Создание ссылки...' : 'Поделиться'}
            </button>
            {shareError && <p className="text-center text-red-400">{shareError}</p>}
            {shareCode && (
              <div className="p-4 bg-green-500/20 border border-green-400/50 rounded-lg text-center">
                <p className="text-sm text-gray-300">Ваш код:</p>
                <p className="text-3xl font-mono font-bold text-green-400">{shareCode}</p>
                <p className="text-xs text-gray-400 mt-2">Скопируйте его. Текст будет удален после прочтения или через 30 минут.</p>
              </div>
            )}
          </div>
        )}

        {mode === 'get' && (
          <div className="space-y-4">
            <input
              type="text"
              value={getCode}
              // ИСПРАВЛЕНИЕ: УБРАЛИ .toUpperCase() и задали стили
              onChange={(e) => setGetCode(e.target.value)}
              placeholder="Введите код для получения текста"
              className="w-full p-3 bg-white/20 border border-white/30 rounded-lg placeholder:text-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleGet}
              disabled={getLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 transition-all"
            >
              {getLoading ? 'Загрузка...' : 'Получить текст'}
            </button>
            {getError && <p className="text-center text-red-400">{getError}</p>}
            {getText && (
              <div className="p-4 bg-white/10 border border-white/20 rounded-lg">
                <p className="text-sm text-gray-300 mb-2">Ваш текст:</p>
                <p className="whitespace-pre-wrap text-white">{getText}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
