// ==========================================
// ЖИЗНИ СМЫСЛ — Общая логика приложения
// ==========================================

// ---- STATE MANAGEMENT ----
const APP_STATE_KEY = 'zhizni_smysl_state';

const defaultState = {
  currentUser: null,
  students: [
    { id: 'u1', name: 'Вячеслав Петров', role: 'student' },
    { id: 'u2', name: 'Владислав Иванов', role: 'student' },
    { id: 'u3', name: 'Наталья Смирнова', role: 'student' },
  ],
  teachers: [
    { id: 't1', name: 'Евгений Сафонов', role: 'teacher' }
  ],
  // Progress: { userId_courseId: { completedLessons: [0,1,2...], currentLesson: 0 } }
  progress: {},
  // Assignments: { assignmentId: { studentId, courseId, lessonIdx, text, files, status, teacherComment, timestamp } }
  assignments: {},
  // Chat: { chatId (studentId_teacherId): [ {senderId, text, timestamp} ] }
  chats: {},
  // Notifications
  notifications: []
};

function loadState() {
  try {
    const saved = localStorage.getItem(APP_STATE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to add any new fields
      return { ...defaultState, ...parsed };
    }
  } catch (e) {}
  return { ...defaultState };
}

function saveState() {
  localStorage.setItem(APP_STATE_KEY, JSON.stringify(window.appState));
}

// Initialize state
window.appState = loadState();

// Make sure default users always exist
window.appState.students = defaultState.students;
window.appState.teachers = defaultState.teachers;
saveState();

// ---- AUTH ----
const PLATFORM_BASE_URL = window.PLATFORM_BASE_URL || 'https://veniaaminprost-dotcom-lifes-meaning-b5dd.twc1.net';

function getPlatformBaseUrl() {
  const saved = localStorage.getItem('platform_base_url');
  return saved || PLATFORM_BASE_URL;
}

function getCourseSlugById(courseId) {
  return (window.COURSES || []).find(c => c.id === courseId)?.slug || null;
}

function redirectToPlatformAuth(tab = 'login', courseId = null) {
  const authPath = tab === 'register' ? '/register' : '/login';
  const url = new URL(authPath, getPlatformBaseUrl());
  const slug = courseId ? getCourseSlugById(courseId) : null;
  if (slug) {
    url.searchParams.set('course', slug);
  }
  window.location.href = url.toString();
}

function getCurrentUser() {
  return window.appState.currentUser;
}

function login(email, password) {
  redirectToPlatformAuth('login');
  return null;
}

function register(name, email, password) {
  redirectToPlatformAuth('register');
  return null;
}

function logout() {
  window.appState.currentUser = null;
  saveState();
}

// ---- COURSES DATA ----
window.COURSES = [
  {
    id: 'panorama',
    slug: 'panorama-biblii',
    title: 'Панорама Библии',
    subtitle: 'Бесплатный онлайн-курс',
    emoji: '📖',
    color: '#C8A882',
    lessons: 11,
    duration: 'несколько часов',
    description: 'Курс предполагает краткое, но информативное путешествие по Библии. Мы подготовили концентрированный и доступный материал, который позволит Вам за несколько часов познакомиться с сутью христианства и основными событиями, изложенными в Священном Писании.',
    fullDescription: `Курс предполагает краткое, но информативное путешествие по Библии. Мы подготовили концентрированный и доступный материал, который позволит Вам за несколько часов познакомиться с сутью христианства и основными событиями, изложенными в Священном Писании.

Вы узнаете о самых ключевых событиях Библии — от сотворения мира до воскресения Христа — и получите целостный взгляд на христианскую веру.`,
    whatYouLearn: [
      'В чём смысл жизни',
      'Как появилось добро и зло',
      'Откуда произошёл израильский народ',
      'Чему на самом деле учил Иисус',
      'В чём уникальность христианской этики',
      'Что такое рай и как туда попасть'
    ],
    forWhom: 'Для всех, кто хочет познакомиться с христианством и Библией с нуля. Курс не требует никаких предварительных знаний.',
    curriculum: [
      { stage: 'Введение', lessons: [
        { title: 'О чём курс?', type: 'intro', duration: '5 мин' }
      ]},
      { stage: 'Ступень №2 — Ветхий Завет', lessons: [
        { title: 'Урок 1. Сотворение мира: начало истории человечества', type: 'lesson', duration: '7 мин', hasTest: false, hasAssignment: true },
        { title: 'Урок 2. Происхождение зла: откуда оно пришло', type: 'lesson', duration: '8 мин', hasTest: true, hasAssignment: false },
        { title: 'Урок 3. Где Бог в страданиях людей?', type: 'lesson', duration: '9 мин', hasTest: false, hasAssignment: true },
        { title: 'Урок 4. Начало Израиля: патриархи и рождение избранного народа', type: 'lesson', duration: '10 мин', hasTest: true, hasAssignment: false },
        { title: 'Урок 5. Период пророков. Голос Бога в истории', type: 'lesson', duration: '8 мин', hasTest: true, hasAssignment: false },
      ]},
      { stage: 'Ступень №3 — Новый Завет', lessons: [
        { title: 'Урок 6. Введение в Новый Завет: начало новой эпохи', type: 'lesson', duration: '7 мин', hasTest: false, hasAssignment: true },
        { title: 'Урок 7. История Рождества. Обещание и исполнение', type: 'lesson', duration: '8 мин', hasTest: true, hasAssignment: false },
        { title: 'Урок 8. Биография Христа: жизнь и служение', type: 'lesson', duration: '11 мин', hasTest: false, hasAssignment: true },
        { title: 'Урок 9. Учение Христа: принципы Царства Божьего', type: 'lesson', duration: '10 мин', hasTest: true, hasAssignment: false },
        { title: 'Урок 10. История Пасхи: смерть и воскресение', type: 'lesson', duration: '9 мин', hasTest: false, hasAssignment: true },
        { title: 'Урок 11. Церковь: происхождение и назначение', type: 'lesson', duration: '8 мин', hasTest: true, hasAssignment: false },
      ]}
    ],
    tests: [
      {
        lessonIdx: 1,
        questions: [
          {
            q: 'Что утверждает библейский взгляд на сотворение человека?',
            options: ['Человек произошёл в результате случайных природных процессов', 'Человек — высшее звено эволюции животного мира', 'Бог сотворил человека по Своему образу и подобию'],
            correct: 2
          },
          {
            q: 'Почему теория случайного возникновения жизни требует веры?',
            options: ['Потому что вероятность случайного появления жизни крайне мала', 'Потому что её невозможно проверить на практике', 'Потому что даже учёные не могут доказать её истинность', 'Все вышеперечисленное'],
            correct: 3
          }
        ]
      }
    ]
  },
  {
    id: 'uniqueness',
    slug: 'unikalnost-biblii',
    title: 'Уникальность Библии',
    subtitle: 'Знакомство с Библией',
    emoji: '✨',
    color: '#B8C8D8',
    lessons: 4,
    duration: '2–3 часа',
    description: 'За 4 урока вы узнаете о том, как и кем Библия была написана, передавалась, сохранялась. А также о том, как начать читать Библию новичку.',
    fullDescription: `За 4 урока вы узнаете о том, как и кем Библия была написана, передавалась, сохранялась на протяжении тысячелетий. А также о том, как начать читать Библию новичку и что делает эту книгу уникальной среди всех когда-либо написанных.`,
    whatYouLearn: [
      'Кто написал Библию и когда',
      'Как Библия сохранялась тысячелетиями',
      'Почему Библия является уникальной книгой',
      'Как правильно начать читать Библию',
    ],
    forWhom: 'Для тех, кто хочет разобраться в происхождении и уникальности Библии как книги.',
    curriculum: [
      { stage: 'Основное содержание', lessons: [
        { title: 'Урок 1. Кто написал Библию?', type: 'lesson', duration: '8 мин', hasTest: true, hasAssignment: false },
        { title: 'Урок 2. Как Библия сохранилась?', type: 'lesson', duration: '7 мин', hasTest: false, hasAssignment: true },
        { title: 'Урок 3. Уникальность Библии', type: 'lesson', duration: '9 мин', hasTest: true, hasAssignment: false },
        { title: 'Урок 4. Как начать читать Библию?', type: 'lesson', duration: '8 мин', hasTest: false, hasAssignment: true },
      ]}
    ]
  },
  {
    id: 'family',
    slug: 'institut-semi',
    title: 'Институт семьи',
    emoji: '👨‍👩‍👧',
    color: '#C8D8B8',
    lessons: 3,
    duration: '1–2 часа',
    description: 'В России 2024 год объявлен годом семьи, но тема здоровых доверительных отношений, взаимоуважения и верности волнует людей не только в этот год, но и в любое время. Именно поэтому нами был разработан данный курс — "Институт семьи".',
    fullDescription: `В России 2024 год объявлен годом семьи, но тема здоровых доверительных отношений, взаимоуважения и верности волнует людей не только в этот год, но и в любое время. Именно поэтому нами был разработан данный курс — "Институт семьи".

Как Библия смотрит на институт семьи? Что говорит христианство об отношениях, любви и браке? Эти вопросы мы рассмотрим в курсе.`,
    whatYouLearn: [
      'Что Библия говорит о браке',
      'Как строить здоровые отношения',
      'Ответственность мужа и жены',
      'Как воспитывать детей по-христиански'
    ],
    forWhom: 'Для семейных пар, молодых людей, планирующих создать семью, и всех интересующихся христианским взглядом на семью.',
    curriculum: [
      { stage: 'Основное содержание', lessons: [
        { title: 'Урок 1. Замысел Бога о семье', type: 'lesson', duration: '10 мин', hasTest: true, hasAssignment: false },
        { title: 'Урок 2. Роли мужа и жены', type: 'lesson', duration: '9 мин', hasTest: false, hasAssignment: true },
        { title: 'Урок 3. Воспитание детей', type: 'lesson', duration: '8 мин', hasTest: true, hasAssignment: false },
      ]}
    ]
  },
  {
    id: 'silence',
    slug: 'molchanie-boga',
    title: 'Молчание Бога',
    emoji: '🕊️',
    color: '#D8C8D4',
    lessons: 2,
    duration: '1 час',
    description: 'Бог молчит уже давно — или это мы разучились Его слышать? В этом курсе мы вместе заглянем в тишину, пройдём путь Иова и Давида, откроем Псалом 40.',
    fullDescription: `Бог молчит уже давно — или это мы разучились Его слышать? В этом курсе мы вместе заглянем в тишину, пройдём путь Иова и Давида, откроем Псалом 40.

Почему Бог порой кажется молчащим? Как верить в трудные времена? Что говорит Библия о страдании и поиске Бога? На эти вопросы мы постараемся найти ответы.`,
    whatYouLearn: [
      'Почему Бог порой кажется молчащим',
      'Опыт Иова: страдание и поиск ответов',
      'Псалмы как молитвы в темноте',
      'Как сохранять веру в трудных обстоятельствах'
    ],
    forWhom: 'Для тех, кто переживает сложный период жизни или задаётся вопросом о молчании Бога.',
    curriculum: [
      { stage: 'Основное содержание', lessons: [
        { title: 'Урок 1. Иов: путь через страдание', type: 'lesson', duration: '12 мин', hasTest: false, hasAssignment: true },
        { title: 'Урок 2. Псалмы: молитва в темноте', type: 'lesson', duration: '11 мин', hasTest: true, hasAssignment: false },
      ]}
    ]
  },
  {
    id: 'summary',
    slug: 'kratkoe-soderzhanie-biblii',
    title: 'Краткое содержание Библии',
    emoji: '📚',
    color: '#D8CDB8',
    lessons: 80,
    duration: '10–15 часов',
    description: 'Путешествие по всем книгам Библии в коротких обзорах: узнайте суть каждой книги и увидите целостную картину Божьего Слова — это путешествие через всё Священное Писание.',
    fullDescription: `Путешествие по всем книгам Библии в коротких обзорах: узнайте суть каждой книги и увидите целостную картину Божьего Слова.

Каждый из 80 уроков посвящён отдельной книге Библии. Вы получите концентрированный обзор содержания, ключевых тем и важнейших отрывков каждой книги.`,
    whatYouLearn: [
      'Содержание каждой из 66 книг Библии',
      'Ключевые темы и герои Ветхого Завета',
      'Послания апостолов и их значение',
      'Целостный взгляд на Священное Писание'
    ],
    forWhom: 'Для тех, кто хочет получить систематическое представление о всём содержании Библии.',
    curriculum: [
      { stage: 'Ветхий Завет', lessons: Array.from({length: 39}, (_, i) => ({
        title: `Урок ${i+1}. ${['Бытие', 'Исход', 'Левит', 'Числа', 'Второзаконие', 'Иисус Навин', 'Книга Судей', 'Руфь', '1-я Царств', '2-я Царств', '3-я Царств', '4-я Царств', '1-я Паралипоменон', '2-я Паралипоменон', 'Ездра', 'Неемия', 'Есфирь', 'Иов', 'Псалтирь', 'Притчи', 'Екклесиаст', 'Песня песней', 'Исаия', 'Иеремия', 'Плач Иеремии', 'Иезекииль', 'Даниил', 'Осия', 'Иоиль', 'Амос', 'Авдий', 'Иона', 'Михей', 'Наум', 'Аввакум', 'Софония', 'Аггей', 'Захария', 'Малахия'][i]}`,
        type: 'lesson', duration: '5–8 мин', hasTest: false, hasAssignment: false
      }))},
      { stage: 'Новый Завет', lessons: Array.from({length: 27}, (_, i) => ({
        title: `Урок ${i+40}. ${['От Матфея', 'От Марка', 'От Луки', 'От Иоанна', 'Деяния', 'Римлянам', '1 Коринфянам', '2 Коринфянам', 'Галатам', 'Ефесянам', 'Филиппийцам', 'Колоссянам', '1 Фессалоникийцам', '2 Фессалоникийцам', '1 Тимофею', '2 Тимофею', 'Титу', 'Филимону', 'Евреям', 'Иакова', '1 Петра', '2 Петра', '1 Иоанна', '2 Иоанна', '3 Иоанна', 'Иуды', 'Откровение'][i]}`,
        type: 'lesson', duration: '5–8 мин', hasTest: false, hasAssignment: false
      }))}
    ]
  }
];

// ---- PROGRESS MANAGEMENT ----
function getProgressKey(userId, courseId) {
  return `${userId}_${courseId}`;
}

function getCourseProgress(userId, courseId) {
  const key = getProgressKey(userId, courseId);
  return window.appState.progress[key] || { completedLessons: [], currentLesson: 0 };
}

function markLessonComplete(userId, courseId, lessonIndex) {
  const key = getProgressKey(userId, courseId);
  if (!window.appState.progress[key]) {
    window.appState.progress[key] = { completedLessons: [], currentLesson: 0 };
  }
  const prog = window.appState.progress[key];
  if (!prog.completedLessons.includes(lessonIndex)) {
    prog.completedLessons.push(lessonIndex);
  }
  prog.currentLesson = lessonIndex + 1;
  saveState();
}

function isLessonComplete(userId, courseId, lessonIndex) {
  const prog = getCourseProgress(userId, courseId);
  return prog.completedLessons.includes(lessonIndex);
}

// ---- ASSIGNMENTS ----
function submitAssignment(studentId, courseId, lessonIdx, text) {
  const id = `asgn_${Date.now()}`;
  const assignment = {
    id, studentId, courseId, lessonIdx, text,
    status: 'pending', // pending | accepted | revision
    teacherComment: '',
    timestamp: new Date().toISOString()
  };
  window.appState.assignments[id] = assignment;
  
  // Add notification for teacher
  window.appState.notifications.push({
    id: 'notif_' + Date.now(),
    type: 'new_assignment',
    text: `Новое задание от студента на проверку`,
    assignmentId: id,
    read: false,
    timestamp: new Date().toISOString()
  });
  
  saveState();
  return assignment;
}

function reviewAssignment(assignmentId, status, comment) {
  const asgn = window.appState.assignments[assignmentId];
  if (asgn) {
    asgn.status = status;
    asgn.teacherComment = comment;
    
    // Notify student
    window.appState.notifications.push({
      id: 'notif_' + Date.now(),
      type: 'assignment_reviewed',
      text: status === 'accepted' ? 'Ваше задание принято!' : 'Задание требует доработки',
      assignmentId,
      studentId: asgn.studentId,
      read: false,
      timestamp: new Date().toISOString()
    });
    
    saveState();
  }
}

function getStudentAssignments(studentId) {
  return Object.values(window.appState.assignments).filter(a => a.studentId === studentId);
}

function getAllPendingAssignments() {
  return Object.values(window.appState.assignments).filter(a => a.status === 'pending');
}

// ---- CHAT ----
function getChatId(studentId, teacherId) {
  return `${studentId}_${teacherId}`;
}

function sendMessage(senderId, receiverId, text) {
  const isTeacher = window.appState.currentUser?.role === 'teacher';
  const chatId = isTeacher 
    ? getChatId(receiverId, senderId)
    : getChatId(senderId, receiverId);
  
  if (!window.appState.chats[chatId]) {
    window.appState.chats[chatId] = [];
  }
  
  const msg = {
    id: 'msg_' + Date.now(),
    senderId, text,
    timestamp: new Date().toISOString()
  };
  window.appState.chats[chatId].push(msg);
  saveState();
  return msg;
}

function getChatMessages(studentId, teacherId) {
  const chatId = getChatId(studentId, teacherId);
  return window.appState.chats[chatId] || [];
}

// ---- NOTIFICATIONS ----
function getUnreadNotifications(userId) {
  return window.appState.notifications.filter(n => {
    if (n.read) return false;
    if (n.type === 'new_assignment') return window.appState.currentUser?.role === 'teacher';
    if (n.type === 'assignment_reviewed') return n.studentId === userId;
    return false;
  });
}

function markNotificationsRead() {
  window.appState.notifications.forEach(n => n.read = true);
  saveState();
}

// ---- TOAST ----
function showToast(title, msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <div class="toast-text">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ---- HEADER SETUP ----
function setupHeader() {
  const user = getCurrentUser();
  const authArea = document.getElementById('header-auth-area');
  if (!authArea) return;
  
  if (user) {
    const notifs = getUnreadNotifications(user.id);
    authArea.innerHTML = `
      <div class="user-menu" style="display:flex;align-items:center;gap:12px;">
        ${notifs.length > 0 ? `<button class="header-auth-btn" onclick="showNotifications()" style="position:relative;">
          🔔<span style="position:absolute;top:-4px;right:-4px;background:var(--color-error);color:white;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;">${notifs.length}</span>
        </button>` : ''}
        ${user.role === 'teacher' ? `<a href="teacher.html" class="btn btn-ghost btn-sm">📋 Кабинет</a>` : 
          `<a href="learn.html" class="btn btn-ghost btn-sm">📚 Обучение</a>`}
        <button class="header-auth-btn" onclick="logoutUser()">👋 ${user.name.split(' ')[0]}</button>
      </div>
    `;
  } else {
    authArea.innerHTML = `
      <button class="header-auth-btn" onclick="openAuthModal('login')">Войти</button>
      <button class="btn btn-primary btn-sm" onclick="openAuthModal('register')">Записаться</button>
    `;
  }
}

function logoutUser() {
  logout();
  showToast('До свидания!', 'Вы вышли из аккаунта', 'info');
  setTimeout(() => location.reload(), 1000);
}

function showNotifications() {
  const user = getCurrentUser();
  if (!user) return;
  const notifs = getUnreadNotifications(user.id);
  markNotificationsRead();
  if (notifs.length === 0) {
    showToast('Уведомления', 'Новых уведомлений нет', 'info');
  } else {
    notifs.forEach(n => showToast('Уведомление', n.text, n.type === 'assignment_reviewed' ? 'success' : 'warning'));
  }
  setupHeader();
}

// ---- AUTH MODAL ----
function openAuthModal(tab = 'login') {
  redirectToPlatformAuth(tab);
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.add('hidden');
}

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-content').forEach(el => {
    el.style.display = el.dataset.tab === tab ? 'block' : 'none';
  });
}

function handleLogin(e) {
  e.preventDefault();
  redirectToPlatformAuth('login');
}

function handleRegister(e) {
  e.preventDefault();
  redirectToPlatformAuth('register');
}

// ---- MOBILE MENU ----
function toggleMobileMenu() {
  const nav = document.getElementById('mobile-nav');
  if (nav) nav.classList.toggle('open');
}

// ---- ACCORDION ----
function initAccordions() {
  document.querySelectorAll('.accordion-head').forEach(head => {
    head.addEventListener('click', () => {
      const item = head.closest('.accordion-item');
      item.classList.toggle('open');
    });
  });
}

// ---- SEARCH ----
function initSearch() {
  const input = document.getElementById('site-search');
  if (!input) return;
  
  input.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      document.querySelectorAll('.searchable').forEach(el => el.style.display = '');
      return;
    }
    document.querySelectorAll('.searchable').forEach(el => {
      const text = el.textContent.toLowerCase();
      el.style.display = text.includes(q) ? '' : 'none';
    });
  });
}

// ---- ON LOAD ----
document.addEventListener('DOMContentLoaded', () => {
  setupHeader();
  initAccordions();
  initSearch();
});
