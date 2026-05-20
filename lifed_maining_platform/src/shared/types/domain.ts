export type UserRole = "admin" | "director" | "editor" | "teacher" | "student";
export type Gender = "male" | "female" | "unknown";
export type MessengerType = "telegram" | "max" | "vk";
export type ReligionRelation = "atheist" | "christian" | "muslim" | "other";
export type ChristianBranch = "orthodox" | "catholic" | "protestant";

export interface Profile {
  userId: string;
  role: UserRole;
  displayName: string;
  gender: Gender;
  phone: string | null;
  messengerType: MessengerType | null;
  messengerContact: string | null;
  religionRelation: ReligionRelation | null;
  christianBranch: ChristianBranch | null;
  christianConfession: string | null;
  religionOther: string | null;
  createdAt: string;
}

export interface MentorAssignment {
  studentId: string;
  mentorId: string;
  assignedBy: string | null;
  assignmentMode: "manual" | "auto";
  createdAt: string;
  updatedAt: string;
}

export interface MentorQuestion {
  id: string;
  studentId: string;
  mentorId: string;
  courseId: string | null;
  lessonId: string | null;
  questionText: string;
  answerText: string | null;
  status: "new" | "answered";
  createdAt: string;
  answeredAt: string | null;
}

export interface LessonChatMessage {
  id: string;
  lessonId: string;
  courseId: string;
  studentId: string;
  mentorId: string;
  authorId: string;
  authorName: string;
  messageText: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  cover: string | null;
  createdBy: string;
  createdAt: string;
  archivedAt: string | null;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  contentType: "video" | "text" | "mixed";
  textContent: string | null;
  videoUrl: string | null;
  orderIndex: number;
  published: boolean;
  createdAt: string;
}

export interface Invitation {
  id: string;
  token: string;
  courseId: string;
  createdBy: string;
  expiresAt: string | null;
  maxUses: number | null;
  usedCount: number;
  createdAt: string;
}

export interface Enrollment {
  userId: string;
  courseId: string;
  joinedAt: string;
}

export type SubmissionStatus = "submitted" | "approved" | "needs_work";

export interface Submission {
  id: string;
  lessonId: string;
  courseId: string;
  studentId: string;
  textAnswer: string;
  filePaths: string[];
  status: SubmissionStatus;
  teacherComment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LessonQuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface LessonQuizQuestion {
  id: string;
  text: string;
  options: LessonQuizOption[];
}

export interface LessonQuiz {
  lessonId: string;
  items: LessonQuizQuestion[];
  updatedAt: string;
}

export interface LessonQuizSubmission {
  lessonId: string;
  studentId: string;
  answers: Record<string, string>;
  score: number;
  total: number;
  updatedAt: string;
}

export interface LessonQuizResult {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  studentId: string;
  studentName: string;
  score: number;
  total: number;
  percent: number;
  updatedAt: string;
}
