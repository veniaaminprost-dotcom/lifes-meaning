create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.user_role := 'student'::public.user_role;
begin
  if (new.raw_app_meta_data ->> 'role') in ('admin', 'teacher', 'student', 'editor', 'director') then
    requested_role := (new.raw_app_meta_data ->> 'role')::public.user_role;
  end if;

  insert into public.profiles (user_id, display_name, role, gender)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), new.email, ''),
    requested_role,
    'unknown'
  )
  on conflict (user_id) do update
  set
    display_name = coalesce(nullif(excluded.display_name, ''), public.profiles.display_name),
    role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
