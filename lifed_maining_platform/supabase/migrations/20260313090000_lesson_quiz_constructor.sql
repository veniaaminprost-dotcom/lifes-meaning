create table if not exists public.lesson_quizzes (
  lesson_id uuid primary key references public.lessons(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_quiz_submissions (
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  score int not null default 0,
  total int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (lesson_id, student_id)
);

create or replace function public.touch_lesson_quiz_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_touch_lesson_quizzes on public.lesson_quizzes;
create trigger trg_touch_lesson_quizzes
before update on public.lesson_quizzes
for each row execute procedure public.touch_lesson_quiz_updated_at();

drop trigger if exists trg_touch_lesson_quiz_submissions on public.lesson_quiz_submissions;
create trigger trg_touch_lesson_quiz_submissions
before update on public.lesson_quiz_submissions
for each row execute procedure public.touch_lesson_quiz_updated_at();

alter table public.lesson_quizzes enable row level security;
alter table public.lesson_quiz_submissions enable row level security;

create policy "lesson_quizzes_select_members"
on public.lesson_quizzes for select
using (
  exists (
    select 1
    from public.lessons l
    where l.id = lesson_id
      and (
        public.can_manage_content(auth.uid())
        or public.is_teacher_on_course(auth.uid(), l.course_id)
        or public.is_student_on_course(auth.uid(), l.course_id)
      )
  )
);

create policy "lesson_quizzes_mutate_content_managers"
on public.lesson_quizzes for all
using (
  exists (
    select 1
    from public.lessons l
    where l.id = lesson_id
      and public.can_manage_content(auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.lessons l
    where l.id = lesson_id
      and public.can_manage_content(auth.uid())
  )
);

create policy "lesson_quiz_submissions_select_self_teacher_admin"
on public.lesson_quiz_submissions for select
using (
  auth.uid() = student_id
  or public.is_admin(auth.uid())
  or exists (
    select 1
    from public.lessons l
    where l.id = lesson_id and public.is_teacher_on_course(auth.uid(), l.course_id)
  )
);

create policy "lesson_quiz_submissions_insert_student"
on public.lesson_quiz_submissions for insert
with check (
  auth.uid() = student_id
  and exists (
    select 1
    from public.lessons l
    where l.id = lesson_id and public.is_student_on_course(auth.uid(), l.course_id)
  )
);

create policy "lesson_quiz_submissions_update_student"
on public.lesson_quiz_submissions for update
using (auth.uid() = student_id)
with check (auth.uid() = student_id);
