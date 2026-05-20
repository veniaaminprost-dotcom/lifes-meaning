drop policy if exists "lessons_select_members" on public.lessons;

create policy "lessons_select_members"
on public.lessons for select
using (
  public.can_manage_content(auth.uid())
  or public.is_teacher_on_course(auth.uid(), course_id)
  or (published = true and public.is_student_on_course(auth.uid(), course_id))
);

drop policy if exists "lesson_quizzes_select_members" on public.lesson_quizzes;

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
        or (l.published = true and public.is_student_on_course(auth.uid(), l.course_id))
      )
  )
);
