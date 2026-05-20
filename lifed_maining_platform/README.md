# Онлайн-библейская школа

React + TypeScript + Redux Toolkit + RTK Query + Supabase + FSD.
Стили синхронизированы с лендингом из `../lifes_maining_landing` (палитра, типографика, атмосфера).

## Что реализовано

- Auth: `login/register/forgot-password`
- RBAC-маршруты и кабинеты ролей `admin/teacher/student`
- Курсы, уроки, инвайты, enrollment, домашние задания
- Слой API для Supabase вынесен в `entities/*/api` и `shared/api/baseApi.ts`
- SQL schema + RLS + Storage policies в `supabase/schema.sql`
- Базовые тесты: reducer, RBAC, компонент формы

## Переменные окружения

Создайте `.env` по примеру `.env.example`:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Запуск

```bash
npm install
npm run dev
```

Сборка и тесты:

```bash
npm run build
npm run test
```

## Как назначить роли admin/teacher

После регистрации пользователя обновите роль в `profiles`:

```sql
update public.profiles
set role = 'admin'
where user_id = 'UUID_ПОЛЬЗОВАТЕЛЯ';

update public.profiles
set role = 'teacher'
where user_id = 'UUID_ПОЛЬЗОВАТЕЛЯ';
```

## Supabase SQL

Примените `supabase/schema.sql` в SQL Editor проекта Supabase.

Скрипт создаёт:

- таблицы: `profiles`, `courses`, `course_teachers`, `lessons`, `invitations`, `enrollments`, `lesson_views`, `submissions`
- функции: `get_my_courses`, `accept_invitation`, проверки роли
- триггеры служебных полей
- RLS policies по ролям
- bucket `course-materials` и storage policies

## Структура FSD

```text
src/
  app/        # провайдеры (router/store/theme/supabase), корневое приложение
  processes/  # место для межстраничных процессов (зарезервировано)
  pages/      # страницы по ролям и public-маршруты
  widgets/    # крупные составные блоки (CourseList, LessonEditor, SubmissionsTable, Navigation)
  features/   # пользовательские сценарии (auth, invite, create-course, lesson-edit, submission-review)
  entities/   # доменные сущности: api/model (courses, lessons, invitations, ...)
  shared/     # общие утилиты, типы, базовый API, UI-обёртки, config
```

## Основной сценарий

1. Admin создаёт курс, назначает teacher, добавляет урок, создаёт invite.
2. Student принимает invite по `/invite/:token`, видит курс в `/student`.
3. Student открывает урок и отправляет домашку.
4. Teacher проверяет домашку и выставляет статус/комментарий.
