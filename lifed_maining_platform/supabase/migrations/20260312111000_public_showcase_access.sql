drop policy if exists "courses_select_public_showcase" on public.courses;
create policy "courses_select_public_showcase"
on public.courses for select
using (archived_at is null);

drop policy if exists "lessons_select_public_showcase" on public.lessons;
create policy "lessons_select_public_showcase"
on public.lessons for select
using (
  published = true
  and exists (
    select 1
    from public.courses c
    where c.id = course_id and c.archived_at is null
  )
);
