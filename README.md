# Жизни Смысл

Репозиторий содержит два связанных приложения онлайн-школы:

- `lifes_maining_landing` — публичная витрина и контентный лендинг онлайн-школы.
- `lifed_maining_platform` — платформа школы на `React + TypeScript + Vite + Supabase`.

## Структура

```text
lifes_main/
  lifes_maining_landing/
  lifed_maining_platform/
```

## Запуск платформы

```bash
cd lifed_maining_platform
npm install
npm run dev
```

Для платформы нужен файл `.env` на основе `.env.example`:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Проверка платформы

```bash
cd lifed_maining_platform
npm run build
npm run test
```

## Деплой на Timeweb

Проект лучше держать двумя отдельными сервисами:

- **Лендинг** — отдельный статический сервис на рекламном домене.
- **Платформа** — отдельный App Platform сервис на домене кабинета.

### Платформа

Timeweb пытается собирать платформу из корня. Для этого в корне добавлен `package.json`, который:

- устанавливает зависимости платформы из `lifed_maining_platform`
- запускает сборку платформы
- копирует итоговый билд в корневую папку `dist/`

Если деплой настраивается вручную, используй:

```bash
npm install
npm run build
```

Публикуемая директория:

```text
dist
```

Переменные окружения для деплоя:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Лендинг

Для лендинга отдельный сервис должен публиковать папку:

```text
lifes_maining_landing
```

Она не требует Node-сборки. Все кнопки входа и записи на курс переводят посетителя на домен платформы:

```text
https://veniaaminprost-dotcom-lifes-meaning-b5dd.twc1.net
```

Если домен платформы изменится, достаточно обновить `PLATFORM_BASE_URL` в:

```text
lifes_maining_landing/app.js
```

Рекомендуемая схема доменов:

- `www.ваш-домен.ru` или `school.ваш-домен.ru` — лендинг
- `platform.ваш-домен.ru` или `cabinet.ваш-домен.ru` — платформа

## Что не хранится в Git

- локальные сборки `dist/`
- временные загрузки `uploads/`
- системные файлы `.DS_Store`
- приватные `.env`
