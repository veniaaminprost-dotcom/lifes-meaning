-- Онлайн библейская школа: schema + RLS + storage policies

create extension if not exists pgcrypto;

create type public.user_role as enum ('admin', 'teacher', 'student');
create type public.lesson_content_type as enum ('video', 'text', 'mixed');
create type public.submission_status as enum ('submitted', 'approved', 'needs_work');

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'student',
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  cover text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.course_teachers (
  course_id uuid not null references public.courses(id) on delete cascade,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (course_id, teacher_id)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  content_type public.lesson_content_type not null,
  text_content text,
  video_url text,
  order_index int not null default 1,
  published boolean not null default false,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  token uuid not null unique default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  expires_at timestamptz,
  max_uses int,
  used_count int not null default 0,
  created_at timestamptz not null default now(),
  constraint invitations_max_uses_positive check (max_uses is null or max_uses > 0)
);

create table if not exists public.enrollments (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create table if not exists public.lesson_views (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  text_answer text not null,
  file_paths text[] not null default '{}',
  status public.submission_status not null default 'submitted',
  teacher_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, student_id)
);

create index if not exists idx_courses_created_by on public.courses(created_by);
create index if not exists idx_lessons_course_id_order on public.lessons(course_id, order_index);
create index if not exists idx_invitations_course_id on public.invitations(course_id);
create index if not exists idx_enrollments_course_id on public.enrollments(course_id);
create index if not exists idx_submissions_course_id on public.submissions(course_id);
create index if not exists idx_submissions_lesson_id on public.submissions(lesson_id);

create or replace function public.set_created_by_for_course()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$;

create or replace function public.set_created_by_for_lesson()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$;

create or replace function public.set_created_by_for_invitation()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$;

create or replace function public.touch_submission_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles p where p.user_id = uid and p.role = 'admin'
  );
$$;

create or replace function public.is_teacher_on_course(uid uuid, target_course uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.course_teachers ct
    where ct.teacher_id = uid and ct.course_id = target_course
  );
$$;

create or replace function public.is_student_on_course(uid uuid, target_course uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.enrollments e
    where e.user_id = uid and e.course_id = target_course
  );
$$;

create or replace function public.get_my_courses()
returns setof public.courses
language sql
security definer
as $$
  select c.*
  from public.courses c
  where
    public.is_admin(auth.uid())
    or c.created_by = auth.uid()
    or public.is_teacher_on_course(auth.uid(), c.id)
    or public.is_student_on_course(auth.uid(), c.id)
  order by c.created_at desc;
$$;

create or replace function public.accept_invitation(token_input uuid)
returns uuid
language plpgsql
security definer
as $$
declare
  invitation_row public.invitations;
  current_user uuid := auth.uid();
begin
  if current_user is null then
    raise exception 'Unauthorized';
  end if;

  select * into invitation_row
  from public.invitations i
  where i.token = token_input
  for update;

  if invitation_row.id is null then
    raise exception 'Invitation not found';
  end if;

  if invitation_row.expires_at is not null and invitation_row.expires_at < now() then
    raise exception 'Invitation expired';
  end if;

  if invitation_row.max_uses is not null and invitation_row.used_count >= invitation_row.max_uses then
    raise exception 'Invitation usage limit reached';
  end if;

  insert into public.enrollments(user_id, course_id)
  values (current_user, invitation_row.course_id)
  on conflict do nothing;

  update public.invitations
  set used_count = used_count + 1
  where id = invitation_row.id;

  return invitation_row.course_id;
end;
$$;

create trigger trg_set_created_by_course
before insert on public.courses
for each row execute procedure public.set_created_by_for_course();

create trigger trg_set_created_by_lesson
before insert on public.lessons
for each row execute procedure public.set_created_by_for_lesson();

create trigger trg_set_created_by_invitation
before insert on public.invitations
for each row execute procedure public.set_created_by_for_invitation();

create trigger trg_touch_submissions
before update on public.submissions
for each row execute procedure public.touch_submission_updated_at();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_teachers enable row level security;
alter table public.lessons enable row level security;
alter table public.invitations enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_views enable row level security;
alter table public.submissions enable row level security;

-- PROFILES
create policy "profiles_select_self_or_admin"
on public.profiles for select
using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "profiles_insert_self"
on public.profiles for insert
with check (auth.uid() = user_id);

create policy "profiles_update_self_or_admin"
on public.profiles for update
using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

-- COURSES
create policy "courses_select_by_membership"
on public.courses for select
using (
  public.is_admin(auth.uid())
  or created_by = auth.uid()
  or public.is_teacher_on_course(auth.uid(), id)
  or public.is_student_on_course(auth.uid(), id)
);

create policy "courses_insert_admin"
on public.courses for insert
with check (public.is_admin(auth.uid()));

create policy "courses_update_admin"
on public.courses for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "courses_delete_admin"
on public.courses for delete
using (public.is_admin(auth.uid()));

-- COURSE_TEACHERS
create policy "course_teachers_select_members"
on public.course_teachers for select
using (
  public.is_admin(auth.uid())
  or teacher_id = auth.uid()
  or public.is_student_on_course(auth.uid(), course_id)
);

create policy "course_teachers_mutate_admin"
on public.course_teachers for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- LESSONS
create policy "lessons_select_members"
on public.lessons for select
using (
  public.is_admin(auth.uid())
  or public.is_teacher_on_course(auth.uid(), course_id)
  or public.is_student_on_course(auth.uid(), course_id)
);

create policy "lessons_insert_admin_or_teacher"
on public.lessons for insert
with check (
  public.is_admin(auth.uid()) or public.is_teacher_on_course(auth.uid(), course_id)
);

create policy "lessons_update_admin_or_teacher"
on public.lessons for update
using (
  public.is_admin(auth.uid()) or public.is_teacher_on_course(auth.uid(), course_id)
)
with check (
  public.is_admin(auth.uid()) or public.is_teacher_on_course(auth.uid(), course_id)
);

create policy "lessons_delete_admin_or_teacher"
on public.lessons for delete
using (
  public.is_admin(auth.uid()) or public.is_teacher_on_course(auth.uid(), course_id)
);

-- INVITATIONS
create policy "invitations_select_admin_teacher"
on public.invitations for select
using (
  public.is_admin(auth.uid()) or public.is_teacher_on_course(auth.uid(), course_id)
);

create policy "invitations_insert_admin"
on public.invitations for insert
with check (public.is_admin(auth.uid()));

create policy "invitations_update_admin"
on public.invitations for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "invitations_delete_admin"
on public.invitations for delete
using (public.is_admin(auth.uid()));

-- ENROLLMENTS
create policy "enrollments_select_self_admin_teacher"
on public.enrollments for select
using (
  auth.uid() = user_id
  or public.is_admin(auth.uid())
  or public.is_teacher_on_course(auth.uid(), course_id)
);

create policy "enrollments_insert_self_or_admin"
on public.enrollments for insert
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "enrollments_delete_self_or_admin"
on public.enrollments for delete
using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- LESSON VIEWS
create policy "lesson_views_select_self_admin_teacher"
on public.lesson_views for select
using (
  auth.uid() = user_id
  or public.is_admin(auth.uid())
  or exists (
    select 1
    from public.lessons l
    where l.id = lesson_id and public.is_teacher_on_course(auth.uid(), l.course_id)
  )
);

create policy "lesson_views_insert_self"
on public.lesson_views for insert
with check (auth.uid() = user_id);

create policy "lesson_views_update_self"
on public.lesson_views for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- SUBMISSIONS
create policy "submissions_select_student_teacher_admin"
on public.submissions for select
using (
  auth.uid() = student_id
  or public.is_admin(auth.uid())
  or public.is_teacher_on_course(auth.uid(), course_id)
);

create policy "submissions_insert_student"
on public.submissions for insert
with check (
  auth.uid() = student_id and public.is_student_on_course(auth.uid(), course_id)
);

create policy "submissions_update_student_teacher_admin"
on public.submissions for update
using (
  auth.uid() = student_id
  or public.is_admin(auth.uid())
  or public.is_teacher_on_course(auth.uid(), course_id)
)
with check (
  auth.uid() = student_id
  or public.is_admin(auth.uid())
  or public.is_teacher_on_course(auth.uid(), course_id)
);

-- STORAGE
insert into storage.buckets (id, name, public)
values ('course-materials', 'course-materials', false)
on conflict (id) do nothing;

create policy "storage_read_by_course_members"
on storage.objects for select
using (
  bucket_id = 'course-materials'
  and (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.courses c where c.id::text = (storage.foldername(name))[1] and c.created_by = auth.uid()
    )
    or exists (
      select 1 from public.course_teachers ct where ct.course_id::text = (storage.foldername(name))[1] and ct.teacher_id = auth.uid()
    )
    or exists (
      select 1 from public.enrollments e where e.course_id::text = (storage.foldername(name))[1] and e.user_id = auth.uid()
    )
  )
);

create policy "storage_upload_admin_teacher"
on storage.objects for insert
with check (
  bucket_id = 'course-materials'
  and (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.course_teachers ct where ct.course_id::text = (storage.foldername(name))[1] and ct.teacher_id = auth.uid()
    )
  )
);

create policy "storage_update_admin_teacher"
on storage.objects for update
using (
  bucket_id = 'course-materials'
  and (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.course_teachers ct where ct.course_id::text = (storage.foldername(name))[1] and ct.teacher_id = auth.uid()
    )
  )
)
with check (
  bucket_id = 'course-materials'
  and (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.course_teachers ct where ct.course_id::text = (storage.foldername(name))[1] and ct.teacher_id = auth.uid()
    )
  )
);

create policy "storage_delete_admin"
on storage.objects for delete
using (bucket_id = 'course-materials' and public.is_admin(auth.uid()));
