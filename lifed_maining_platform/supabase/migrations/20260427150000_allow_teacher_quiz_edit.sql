drop policy if exists "lesson_quizzes_mutate_content_managers" on public.lesson_quizzes;

create policy "lesson_quizzes_mutate_content_managers"
on public.lesson_quizzes for all
using (
  exists (
    select 1
    from public.lessons l
    where l.id = lesson_id
      and (
        public.can_manage_content(auth.uid())
        or public.is_teacher_on_course(auth.uid(), l.course_id)
      )
  )
)
with check (
  exists (
    select 1
    from public.lessons l
    where l.id = lesson_id
      and (
        public.can_manage_content(auth.uid())
        or public.is_teacher_on_course(auth.uid(), l.course_id)
      )
  )
);
