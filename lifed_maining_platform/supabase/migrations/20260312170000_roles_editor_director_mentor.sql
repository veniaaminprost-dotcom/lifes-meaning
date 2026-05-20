do $$
begin
  alter type public.user_role add value if not exists 'editor';
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter type public.user_role add value if not exists 'director';
exception
  when duplicate_object then null;
end $$;

alter table public.profiles
add column if not exists gender text not null default 'unknown';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_gender_check'
  ) then
    alter table public.profiles
    add constraint profiles_gender_check
    check (gender in ('male', 'female', 'unknown'));
  end if;
end $$;

create or replace function public.is_director(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = uid and p.role::text in ('admin', 'director')
  );
$$;

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select public.is_director(uid);
$$;

create or replace function public.is_editor(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = uid and p.role::text = 'editor'
  );
$$;

create or replace function public.can_manage_content(uid uuid)
returns boolean
language sql
stable
as $$
  select public.is_admin(uid) or public.is_editor(uid);
$$;

create table if not exists public.mentor_distribution_settings (
  id boolean primary key default true check (id = true),
  enabled boolean not null default false,
  prefer_gender boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.mentor_distribution_settings (id, enabled, prefer_gender)
values (true, false, true)
on conflict (id) do nothing;

create table if not exists public.mentor_assignments (
  student_id uuid primary key references auth.users(id) on delete cascade,
  mentor_id uuid not null references auth.users(id) on delete restrict,
  assigned_by uuid references auth.users(id) on delete set null,
  assignment_mode text not null default 'manual' check (assignment_mode in ('manual', 'auto')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mentor_questions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  mentor_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  lesson_id uuid references public.lessons(id) on delete set null,
  question_text text not null,
  answer_text text,
  status text not null default 'new' check (status in ('new', 'answered')),
  created_at timestamptz not null default now(),
  answered_at timestamptz
);

create index if not exists idx_mentor_assignments_mentor on public.mentor_assignments(mentor_id);
create index if not exists idx_mentor_questions_student on public.mentor_questions(student_id, created_at desc);
create index if not exists idx_mentor_questions_mentor on public.mentor_questions(mentor_id, created_at desc);

create or replace function public.touch_mentor_assignment_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_touch_mentor_assignments on public.mentor_assignments;
create trigger trg_touch_mentor_assignments
before update on public.mentor_assignments
for each row execute procedure public.touch_mentor_assignment_updated_at();

create or replace function public.assign_mentor_for_student(
  target_student uuid,
  mode text default 'auto',
  forced_mentor uuid default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  chosen_mentor uuid;
  student_gender text;
  prefer_gender_enabled boolean := true;
begin
  if target_student is null then
    return null;
  end if;

  select p.gender into student_gender
  from public.profiles p
  where p.user_id = target_student;

  select s.prefer_gender into prefer_gender_enabled
  from public.mentor_distribution_settings s
  where s.id = true;

  if forced_mentor is not null then
    chosen_mentor := forced_mentor;
  else
    if prefer_gender_enabled and student_gender in ('male', 'female') then
      select p.user_id into chosen_mentor
      from public.profiles p
      where p.role::text = 'teacher'
        and (p.gender = student_gender or p.gender = 'unknown')
      order by (
        select count(*)
        from public.mentor_assignments ma
        where ma.mentor_id = p.user_id
      ) asc, p.created_at asc
      limit 1;
    end if;

    if chosen_mentor is null then
      select p.user_id into chosen_mentor
      from public.profiles p
      where p.role::text = 'teacher'
      order by (
        select count(*)
        from public.mentor_assignments ma
        where ma.mentor_id = p.user_id
      ) asc, p.created_at asc
      limit 1;
    end if;
  end if;

  if chosen_mentor is null then
    return null;
  end if;

  insert into public.mentor_assignments (student_id, mentor_id, assigned_by, assignment_mode)
  values (target_student, chosen_mentor, auth.uid(), mode)
  on conflict (student_id)
  do update
  set mentor_id = excluded.mentor_id,
      assigned_by = excluded.assigned_by,
      assignment_mode = excluded.assignment_mode,
      updated_at = now();

  return chosen_mentor;
end;
$$;

create or replace function public.auto_assign_mentor_on_enrollment()
returns trigger
language plpgsql
security definer
as $$
declare
  auto_enabled boolean := false;
begin
  select s.enabled into auto_enabled
  from public.mentor_distribution_settings s
  where s.id = true;

  if auto_enabled then
    perform public.assign_mentor_for_student(new.user_id, 'auto', null);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_auto_assign_mentor_on_enrollment on public.enrollments;
create trigger trg_auto_assign_mentor_on_enrollment
after insert on public.enrollments
for each row execute procedure public.auto_assign_mentor_on_enrollment();

create or replace function public.get_my_courses()
returns setof public.courses
language sql
security definer
as $$
  select c.*
  from public.courses c
  where
    public.can_manage_content(auth.uid())
    or c.created_by = auth.uid()
    or public.is_teacher_on_course(auth.uid(), c.id)
    or public.is_student_on_course(auth.uid(), c.id)
  order by c.created_at desc;
$$;

alter table public.mentor_distribution_settings enable row level security;
alter table public.mentor_assignments enable row level security;
alter table public.mentor_questions enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles for select
using (
  auth.uid() = user_id
  or public.is_admin(auth.uid())
  or exists (
    select 1
    from public.mentor_assignments ma
    where ma.student_id = user_id and ma.mentor_id = auth.uid()
  )
);

drop policy if exists "courses_select_by_membership" on public.courses;
create policy "courses_select_by_membership"
on public.courses for select
using (
  public.can_manage_content(auth.uid())
  or created_by = auth.uid()
  or public.is_teacher_on_course(auth.uid(), id)
  or public.is_student_on_course(auth.uid(), id)
);

drop policy if exists "courses_insert_admin" on public.courses;
create policy "courses_insert_admin"
on public.courses for insert
with check (public.can_manage_content(auth.uid()));

drop policy if exists "courses_update_admin" on public.courses;
create policy "courses_update_admin"
on public.courses for update
using (public.can_manage_content(auth.uid()))
with check (public.can_manage_content(auth.uid()));

drop policy if exists "courses_delete_admin" on public.courses;
create policy "courses_delete_admin"
on public.courses for delete
using (public.can_manage_content(auth.uid()));

drop policy if exists "lessons_insert_admin_or_teacher" on public.lessons;
create policy "lessons_insert_admin_or_teacher"
on public.lessons for insert
with check (
  public.can_manage_content(auth.uid()) or public.is_teacher_on_course(auth.uid(), course_id)
);

drop policy if exists "lessons_update_admin_or_teacher" on public.lessons;
create policy "lessons_update_admin_or_teacher"
on public.lessons for update
using (
  public.can_manage_content(auth.uid()) or public.is_teacher_on_course(auth.uid(), course_id)
)
with check (
  public.can_manage_content(auth.uid()) or public.is_teacher_on_course(auth.uid(), course_id)
);

drop policy if exists "lessons_delete_admin_or_teacher" on public.lessons;
create policy "lessons_delete_admin_or_teacher"
on public.lessons for delete
using (
  public.can_manage_content(auth.uid()) or public.is_teacher_on_course(auth.uid(), course_id)
);

drop policy if exists "storage_upload_admin_teacher" on storage.objects;
create policy "storage_upload_admin_teacher"
on storage.objects for insert
with check (
  bucket_id = 'course-materials'
  and (
    public.can_manage_content(auth.uid())
    or exists (
      select 1 from public.course_teachers ct where ct.course_id::text = (storage.foldername(name))[1] and ct.teacher_id = auth.uid()
    )
  )
);

drop policy if exists "storage_update_admin_teacher" on storage.objects;
create policy "storage_update_admin_teacher"
on storage.objects for update
using (
  bucket_id = 'course-materials'
  and (
    public.can_manage_content(auth.uid())
    or exists (
      select 1 from public.course_teachers ct where ct.course_id::text = (storage.foldername(name))[1] and ct.teacher_id = auth.uid()
    )
  )
)
with check (
  bucket_id = 'course-materials'
  and (
    public.can_manage_content(auth.uid())
    or exists (
      select 1 from public.course_teachers ct where ct.course_id::text = (storage.foldername(name))[1] and ct.teacher_id = auth.uid()
    )
  )
);

drop policy if exists "storage_delete_admin" on storage.objects;
create policy "storage_delete_admin"
on storage.objects for delete
using (bucket_id = 'course-materials' and public.can_manage_content(auth.uid()));

create policy "mentor_distribution_settings_select_admin"
on public.mentor_distribution_settings for select
using (public.is_admin(auth.uid()));

create policy "mentor_distribution_settings_update_admin"
on public.mentor_distribution_settings for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "mentor_assignments_select_relevant"
on public.mentor_assignments for select
using (
  auth.uid() = student_id
  or auth.uid() = mentor_id
  or public.is_admin(auth.uid())
);

create policy "mentor_assignments_mutate_admin"
on public.mentor_assignments for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "mentor_questions_select_relevant"
on public.mentor_questions for select
using (
  auth.uid() = student_id
  or auth.uid() = mentor_id
  or public.is_admin(auth.uid())
);

create policy "mentor_questions_insert_student"
on public.mentor_questions for insert
with check (
  auth.uid() = student_id
  and exists (
    select 1
    from public.mentor_assignments ma
    where ma.student_id = auth.uid() and ma.mentor_id = mentor_id
  )
);

create policy "mentor_questions_update_mentor_or_admin"
on public.mentor_questions for update
using (
  auth.uid() = mentor_id
  or public.is_admin(auth.uid())
)
with check (
  auth.uid() = mentor_id
  or public.is_admin(auth.uid())
);
