create table if not exists public.lesson_chat_messages (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  mentor_id uuid not null references auth.users(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  message_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_lesson_chat_messages_lesson_student
  on public.lesson_chat_messages(lesson_id, student_id, created_at);

create index if not exists idx_lesson_chat_messages_mentor
  on public.lesson_chat_messages(mentor_id, created_at desc);

alter table public.lesson_chat_messages enable row level security;

drop policy if exists "lesson_chat_select_participants_and_directors" on public.lesson_chat_messages;
create policy "lesson_chat_select_participants_and_directors"
on public.lesson_chat_messages for select
using (
  student_id = auth.uid()
  or mentor_id = auth.uid()
  or public.is_director(auth.uid())
);

drop policy if exists "lesson_chat_insert_student_or_assigned_mentor" on public.lesson_chat_messages;
create policy "lesson_chat_insert_student_or_assigned_mentor"
on public.lesson_chat_messages for insert
with check (
  author_id = auth.uid()
  and exists (
    select 1
    from public.lessons l
    where l.id = lesson_chat_messages.lesson_id
      and l.course_id = lesson_chat_messages.course_id
  )
  and (
    (
      student_id = auth.uid()
      and exists (
        select 1
        from public.mentor_assignments ma
        where ma.student_id = lesson_chat_messages.student_id
          and ma.mentor_id = lesson_chat_messages.mentor_id
      )
    )
    or (
      mentor_id = auth.uid()
      and exists (
        select 1
        from public.mentor_assignments ma
        where ma.student_id = lesson_chat_messages.student_id
          and ma.mentor_id = auth.uid()
      )
    )
  )
);
