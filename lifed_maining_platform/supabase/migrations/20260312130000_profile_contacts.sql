alter table public.profiles
add column if not exists phone text,
add column if not exists messenger_type text,
add column if not exists messenger_contact text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_messenger_type_check'
  ) then
    alter table public.profiles
    add constraint profiles_messenger_type_check
    check (messenger_type is null or messenger_type in ('telegram', 'other'));
  end if;
end $$;
