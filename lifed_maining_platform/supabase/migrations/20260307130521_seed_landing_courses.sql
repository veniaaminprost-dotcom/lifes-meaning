do $$
declare
  owner_id uuid;
  panorama_id uuid;
  uniqueness_id uuid;
  family_id uuid;
  silence_id uuid;
  summary_id uuid;
begin
  select p.user_id into owner_id from public.profiles p order by p.created_at asc limit 1;

  if owner_id is null then
    raise exception 'No profiles found. Register at least one user first.';
  end if;

  update public.profiles
  set display_name = coalesce(nullif(display_name, ''), 'Студент Жизни Смысл')
  where user_id = owner_id;

  update public.profiles
  set role = 'admin'
  where user_id = owner_id;

  insert into public.courses (title, description, created_by)
  values ('Панорама Библии', 'Краткое, но информативное путешествие по Библии. Познакомьтесь с сутью христианства и основными событиями Священного Писания.', owner_id)
  on conflict do nothing;

  insert into public.courses (title, description, created_by)
  values ('Уникальность Библии', 'Узнайте, как и кем Библия была написана, передавалась и сохранялась. Как начать читать Библию, если вы новичок.', owner_id)
  on conflict do nothing;

  insert into public.courses (title, description, created_by)
  values ('Институт семьи', 'Курс о христианском взгляде на семью, отношениях, верности и взаимоуважении.', owner_id)
  on conflict do nothing;

  insert into public.courses (title, description, created_by)
  values ('Молчание Бога', 'Курс о вере в трудные времена, пути Иова и молитве в темноте.', owner_id)
  on conflict do nothing;

  insert into public.courses (title, description, created_by)
  values ('Краткое содержание Библии', 'Путешествие по книгам Библии в коротких обзорах и целостная картина Священного Писания.', owner_id)
  on conflict do nothing;

  select id into panorama_id from public.courses where title = 'Панорама Библии' limit 1;
  select id into uniqueness_id from public.courses where title = 'Уникальность Библии' limit 1;
  select id into family_id from public.courses where title = 'Институт семьи' limit 1;
  select id into silence_id from public.courses where title = 'Молчание Бога' limit 1;
  select id into summary_id from public.courses where title = 'Краткое содержание Библии' limit 1;

  if panorama_id is not null then
    insert into public.lessons (course_id, title, content_type, text_content, video_url, order_index, published, created_by)
    values
      (panorama_id, 'О чём курс?', 'video', 'Видео-урок курса «Панорама Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 1, true, owner_id),
      (panorama_id, 'Урок 1. Сотворение мира: начало истории человечества', 'video', 'Видео-урок курса «Панорама Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 2, true, owner_id),
      (panorama_id, 'Урок 2. Происхождение зла: откуда оно пришло', 'video', 'Видео-урок курса «Панорама Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 3, true, owner_id),
      (panorama_id, 'Урок 3. Где Бог в страданиях людей?', 'video', 'Видео-урок курса «Панорама Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 4, true, owner_id),
      (panorama_id, 'Урок 4. Начало Израиля: патриархи и рождение избранного народа', 'video', 'Видео-урок курса «Панорама Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 5, true, owner_id),
      (panorama_id, 'Урок 5. Период пророков. Голос Бога в истории', 'video', 'Видео-урок курса «Панорама Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 6, true, owner_id),
      (panorama_id, 'Урок 6. Введение в Новый Завет: начало новой эпохи', 'video', 'Видео-урок курса «Панорама Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 7, true, owner_id),
      (panorama_id, 'Урок 7. История Рождества. Обещание и исполнение', 'video', 'Видео-урок курса «Панорама Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 8, true, owner_id),
      (panorama_id, 'Урок 8. Биография Христа: жизнь и служение', 'video', 'Видео-урок курса «Панорама Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 9, true, owner_id),
      (panorama_id, 'Урок 9. Учение Христа: принципы Царства Божьего', 'video', 'Видео-урок курса «Панорама Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 10, true, owner_id),
      (panorama_id, 'Урок 10. История Пасхи: смерть и воскресение', 'video', 'Видео-урок курса «Панорама Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 11, true, owner_id),
      (panorama_id, 'Урок 11. Церковь: происхождение и назначение', 'video', 'Видео-урок курса «Панорама Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 12, true, owner_id)
    on conflict do nothing;
  end if;

  if uniqueness_id is not null then
    insert into public.lessons (course_id, title, content_type, text_content, video_url, order_index, published, created_by)
    values
      (uniqueness_id, 'Урок 1. Кто написал Библию?', 'video', 'Видео-урок курса «Уникальность Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 1, true, owner_id),
      (uniqueness_id, 'Урок 2. Как Библия сохранилась?', 'video', 'Видео-урок курса «Уникальность Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 2, true, owner_id),
      (uniqueness_id, 'Урок 3. Уникальность Библии', 'video', 'Видео-урок курса «Уникальность Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 3, true, owner_id),
      (uniqueness_id, 'Урок 4. Как начать читать Библию?', 'video', 'Видео-урок курса «Уникальность Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 4, true, owner_id)
    on conflict do nothing;
  end if;

  if family_id is not null then
    insert into public.lessons (course_id, title, content_type, text_content, video_url, order_index, published, created_by)
    values
      (family_id, 'Урок 1. Замысел Бога о семье', 'video', 'Видео-урок курса «Институт семьи».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 1, true, owner_id),
      (family_id, 'Урок 2. Роли мужа и жены', 'video', 'Видео-урок курса «Институт семьи».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 2, true, owner_id),
      (family_id, 'Урок 3. Воспитание детей', 'video', 'Видео-урок курса «Институт семьи».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 3, true, owner_id)
    on conflict do nothing;
  end if;

  if silence_id is not null then
    insert into public.lessons (course_id, title, content_type, text_content, video_url, order_index, published, created_by)
    values
      (silence_id, 'Урок 1. Иов: путь через страдание', 'video', 'Видео-урок курса «Молчание Бога».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 1, true, owner_id),
      (silence_id, 'Урок 2. Псалмы: молитва в темноте', 'video', 'Видео-урок курса «Молчание Бога».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 2, true, owner_id)
    on conflict do nothing;
  end if;

  if summary_id is not null then
    insert into public.lessons (course_id, title, content_type, text_content, video_url, order_index, published, created_by)
    values
      (summary_id, 'Урок 1. Бытие', 'video', 'Видео-урок курса «Краткое содержание Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 1, true, owner_id),
      (summary_id, 'Урок 2. Исход', 'video', 'Видео-урок курса «Краткое содержание Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 2, true, owner_id),
      (summary_id, 'Урок 3. Левит', 'video', 'Видео-урок курса «Краткое содержание Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 3, true, owner_id),
      (summary_id, 'Урок 4. Числа', 'video', 'Видео-урок курса «Краткое содержание Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 4, true, owner_id),
      (summary_id, 'Урок 5. Второзаконие', 'video', 'Видео-урок курса «Краткое содержание Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 5, true, owner_id),
      (summary_id, 'Урок 40. От Матфея', 'video', 'Видео-урок курса «Краткое содержание Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 6, true, owner_id),
      (summary_id, 'Урок 41. От Марка', 'video', 'Видео-урок курса «Краткое содержание Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 7, true, owner_id),
      (summary_id, 'Урок 42. От Луки', 'video', 'Видео-урок курса «Краткое содержание Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 8, true, owner_id),
      (summary_id, 'Урок 43. От Иоанна', 'video', 'Видео-урок курса «Краткое содержание Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 9, true, owner_id),
      (summary_id, 'Урок 66. Откровение', 'video', 'Видео-урок курса «Краткое содержание Библии».', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 10, true, owner_id)
    on conflict do nothing;
  end if;

  insert into public.enrollments (user_id, course_id)
  select p.user_id, c.id
  from public.profiles p
  join public.courses c on c.title in (
    'Панорама Библии', 'Уникальность Библии', 'Институт семьи', 'Молчание Бога', 'Краткое содержание Библии'
  )
  on conflict do nothing;
end $$;
