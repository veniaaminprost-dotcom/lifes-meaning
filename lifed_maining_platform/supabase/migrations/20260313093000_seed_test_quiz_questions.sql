do $$
declare
  lesson_row record;
  items jsonb;
begin
  for lesson_row in
    select l.id, l.title
    from public.lessons l
    join public.courses c on c.id = l.course_id
    where c.title = 'Институт семьи'
      and l.published = true
  loop
    if lesson_row.title = 'Урок 1. Замысел Бога о семье' then
      items := jsonb_build_array(
        jsonb_build_object(
          'id', 'family-q1',
          'text', 'Что является главным основанием здоровой семьи?',
          'options', jsonb_build_array(
            jsonb_build_object('id', 'family-q1-a1', 'text', 'Общие ценности и ответственность', 'isCorrect', true),
            jsonb_build_object('id', 'family-q1-a2', 'text', 'Только финансовая стабильность', 'isCorrect', false),
            jsonb_build_object('id', 'family-q1-a3', 'text', 'Случайное совпадение характеров', 'isCorrect', false)
          )
        ),
        jsonb_build_object(
          'id', 'family-q2',
          'text', 'Как лучше укреплять доверие между супругами?',
          'options', jsonb_build_array(
            jsonb_build_object('id', 'family-q2-a1', 'text', 'Открыто обсуждать трудности', 'isCorrect', true),
            jsonb_build_object('id', 'family-q2-a2', 'text', 'Избегать разговоров о проблемах', 'isCorrect', false),
            jsonb_build_object('id', 'family-q2-a3', 'text', 'Сравнивать друг друга с другими семьями', 'isCorrect', false)
          )
        ),
        jsonb_build_object(
          'id', 'family-q3',
          'text', 'Что важнее в семейных отношениях?',
          'options', jsonb_build_array(
            jsonb_build_object('id', 'family-q3-a1', 'text', 'Взаимоуважение и служение', 'isCorrect', true),
            jsonb_build_object('id', 'family-q3-a2', 'text', 'Личное превосходство', 'isCorrect', false),
            jsonb_build_object('id', 'family-q3-a3', 'text', 'Полный контроль одной стороны', 'isCorrect', false)
          )
        ),
        jsonb_build_object(
          'id', 'family-q4',
          'text', 'Какой путь помогает семье расти?',
          'options', jsonb_build_array(
            jsonb_build_object('id', 'family-q4-a1', 'text', 'Совместная молитва и диалог', 'isCorrect', true),
            jsonb_build_object('id', 'family-q4-a2', 'text', 'Игнорирование потребностей друг друга', 'isCorrect', false),
            jsonb_build_object('id', 'family-q4-a3', 'text', 'Жизнь без общих договорённостей', 'isCorrect', false)
          )
        )
      );
    elsif lesson_row.title = 'Урок 2. Роли мужа и жены' then
      items := jsonb_build_array(
        jsonb_build_object(
          'id', 'roles-q1',
          'text', 'Какая модель семьи считается зрелой?',
          'options', jsonb_build_array(
            jsonb_build_object('id', 'roles-q1-a1', 'text', 'Партнёрство и ответственность', 'isCorrect', true),
            jsonb_build_object('id', 'roles-q1-a2', 'text', 'Соперничество и давление', 'isCorrect', false),
            jsonb_build_object('id', 'roles-q1-a3', 'text', 'Безразличие к обязанностям', 'isCorrect', false)
          )
        ),
        jsonb_build_object(
          'id', 'roles-q2',
          'text', 'Что помогает распределять роли без конфликтов?',
          'options', jsonb_build_array(
            jsonb_build_object('id', 'roles-q2-a1', 'text', 'Обсуждение и согласование', 'isCorrect', true),
            jsonb_build_object('id', 'roles-q2-a2', 'text', 'Ультиматумы', 'isCorrect', false),
            jsonb_build_object('id', 'roles-q2-a3', 'text', 'Молчаливые ожидания', 'isCorrect', false)
          )
        ),
        jsonb_build_object(
          'id', 'roles-q3',
          'text', 'Что укрепляет близость в браке?',
          'options', jsonb_build_array(
            jsonb_build_object('id', 'roles-q3-a1', 'text', 'Забота и уважение', 'isCorrect', true),
            jsonb_build_object('id', 'roles-q3-a2', 'text', 'Постоянная критика', 'isCorrect', false),
            jsonb_build_object('id', 'roles-q3-a3', 'text', 'Сравнение с другими', 'isCorrect', false)
          )
        )
      );
    elsif lesson_row.title = 'Урок 3. Воспитание детей' then
      items := jsonb_build_array(
        jsonb_build_object(
          'id', 'kids-q1',
          'text', 'Что формирует чувство безопасности у ребёнка?',
          'options', jsonb_build_array(
            jsonb_build_object('id', 'kids-q1-a1', 'text', 'Последовательность родителей', 'isCorrect', true),
            jsonb_build_object('id', 'kids-q1-a2', 'text', 'Резкие запреты без объяснений', 'isCorrect', false),
            jsonb_build_object('id', 'kids-q1-a3', 'text', 'Полное отсутствие границ', 'isCorrect', false)
          )
        ),
        jsonb_build_object(
          'id', 'kids-q2',
          'text', 'Как лучше передавать ценности детям?',
          'options', jsonb_build_array(
            jsonb_build_object('id', 'kids-q2-a1', 'text', 'Личным примером', 'isCorrect', true),
            jsonb_build_object('id', 'kids-q2-a2', 'text', 'Только наказаниями', 'isCorrect', false),
            jsonb_build_object('id', 'kids-q2-a3', 'text', 'Случайными советами', 'isCorrect', false)
          )
        ),
        jsonb_build_object(
          'id', 'kids-q3',
          'text', 'Что помогает расти ответственности ребёнка?',
          'options', jsonb_build_array(
            jsonb_build_object('id', 'kids-q3-a1', 'text', 'Постепенная самостоятельность', 'isCorrect', true),
            jsonb_build_object('id', 'kids-q3-a2', 'text', 'Гиперопека во всём', 'isCorrect', false),
            jsonb_build_object('id', 'kids-q3-a3', 'text', 'Игнорирование успехов', 'isCorrect', false)
          )
        )
      );
    else
      items := jsonb_build_array(
        jsonb_build_object(
          'id', lesson_row.id::text || '-q1',
          'text', 'Тестовый вопрос 1',
          'options', jsonb_build_array(
            jsonb_build_object('id', lesson_row.id::text || '-q1-a1', 'text', 'Вариант A', 'isCorrect', true),
            jsonb_build_object('id', lesson_row.id::text || '-q1-a2', 'text', 'Вариант B', 'isCorrect', false)
          )
        ),
        jsonb_build_object(
          'id', lesson_row.id::text || '-q2',
          'text', 'Тестовый вопрос 2',
          'options', jsonb_build_array(
            jsonb_build_object('id', lesson_row.id::text || '-q2-a1', 'text', 'Вариант A', 'isCorrect', false),
            jsonb_build_object('id', lesson_row.id::text || '-q2-a2', 'text', 'Вариант B', 'isCorrect', true)
          )
        )
      );
    end if;

    insert into public.lesson_quizzes (lesson_id, items)
    values (lesson_row.id, items)
    on conflict (lesson_id)
    do update set
      items = excluded.items,
      updated_at = now();
  end loop;
end $$;
