update public.profiles
set messenger_type = null
where messenger_type is not null
  and messenger_type not in ('telegram', 'max', 'vk');

alter table public.profiles
drop constraint if exists profiles_messenger_type_check;

alter table public.profiles
add constraint profiles_messenger_type_check
check (messenger_type is null or messenger_type in ('telegram', 'max', 'vk'));
