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
      setShareText(''); // Очищаем поле после успешной отправки
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
      setGetCode(''); // Очищаем поле после получения
    } catch (error: any) {
      setGetError(error.message);
    } finally {
      setGetLoading(false);
    }
  };

  return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-center text-gray-800">Обменник текстом</h1>

          {/* Переключатель режимов */}
          <div className="flex justify-center p-1 bg-gray-100 rounded-lg">
            <button
                onClick={() => setMode('share')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                    mode === 'share' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
            >
              Поделиться
            </button>
            <button
                onClick={() => setMode('get')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                    mode === 'get' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
            >
              Получить
            </button>
          </div>

          {/* Режим "Поделиться" */}
          {mode === 'share' && (
              <div className="space-y-4">
            <textarea
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                placeholder="Введите ваш текст здесь..."
                className="w-full h-40 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
                <button
                    onClick={handleShare}
                    disabled={shareLoading}
                    className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {shareLoading ? 'Создание ссылки...' : 'Поделиться'}
                </button>
                {shareError && <p className="text-center text-red-500">{shareError}</p>}
                {shareCode && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                      <p className="text-sm text-gray-600">Ваш код:</p>
                      <p className="text-2xl font-mono font-bold text-green-700">{shareCode}</p>
                      <p className="text-xs text-gray-500 mt-2">Скопируйте его. Текст будет удален после прочтения.</p>
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
                    onChange={(e) => setGetCode(e.target.value.toUpperCase())}
                    placeholder="Введите код для получения текста"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleGet}
                    disabled={getLoading}
                    className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {getLoading ? 'Загрузка...' : 'Получить текст'}
                </button>
                {getError && <p className="text-center text-red-500">{getError}</p>}
                {getText && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Ваш текст:</p>
                      <p className="whitespace-pre-wrap text-gray-800">{getText}</p>
                    </div>
                )}
              </div>
          )}
        </div>
      </main>
  );
}