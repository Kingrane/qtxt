# qtxt

Анонимный обменник текстом и маленькими файлами по короткому коду.

## Сервер

```bash
npm install
npm run dev
```

Откроется на [http://localhost:3000](http://localhost:3000).

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер |
| `npm run build` | Продакшн-билд |
| `npm run start` | Запуск продакшн-сервера |
| `npm run lint` | ESLint |

## API

**Поделиться текстом:**
```
POST /api/share
Body: { "text": "...", "customCode": "optional" }
```

**Получить текст:**
```
GET /api/get?code=CODE
```

## Окружение

Требуются переменные Vercel KV:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

## Локализация

Язык определяется автоматически по `navigator.language`. Русский для `ru*`, английский для всех остальных.
