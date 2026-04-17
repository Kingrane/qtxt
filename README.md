qtxt: быстрый обмен текстом по короткому коду.

## Быстрый старт

Запуск дев-сервера:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

Редактируйте `app/page.tsx`, изменения применяются автоматически.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## CLI примеры (curl)

Подсказка по командам:

```bash
curl -s "https://qqtxt.me/api/help?format=plain"
```

Получить текст по коду:

```bash
curl -s "https://qqtxt.me/api/get?code=ABCD&format=plain"
```

Отправить текст (stdin) и получить код:

```bash
printf "%s" "много строк\nвот так" | curl -s -X POST "https://qqtxt.me/api/share?format=plain" -H "Content-Type: text/plain" --data-binary @-
```

Отправить файл и получить код:

```bash
curl -s -X POST "https://qqtxt.me/api/share?format=plain" -H "Content-Type: text/plain" --data-binary @"./file.txt"
```

Свой код:

```bash
curl -s -X POST "https://qqtxt.me/api/share?code=MYCODE&format=plain" -H "Content-Type: text/plain" --data-binary @"./file.txt"
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
