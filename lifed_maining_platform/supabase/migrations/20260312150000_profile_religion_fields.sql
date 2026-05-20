alter table public.profiles
add column if not exists religion_relation text,
add column if not exists christian_branch text,
add column if not exists christian_confession text,
add column if not exists religion_other text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_religion_relation_check'
  ) then
    alter table public.profiles
    add constraint profiles_religion_relation_check
    check (
      religion_relation is null
      or religion_relation in ('atheist', 'christian', 'muslim', 'other')
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_christian_branch_check'
  ) then
    alter table public.profiles
    add constraint profiles_christian_branch_check
    check (
      christian_branch is null
      or christian_branch in ('orthodox', 'catholic', 'protestant')
    );
  end if;
end $$;
