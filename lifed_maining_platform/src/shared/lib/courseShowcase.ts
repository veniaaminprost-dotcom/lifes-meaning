import type { UserRole } from "@/shared/types";
import type { CourseIconKey } from "@/shared/ui/CourseGlyph";

type ShowcaseTheme = {
  iconKey: CourseIconKey;
  accent: string;
  coverTone: string;
};

const COURSE_THEMES: Record<string, ShowcaseTheme> = {
  "Панорама Библии": {
    iconKey: "panorama",
    accent: "#b58c6f",
    coverTone: "linear-gradient(145deg, #b58c6f, #8d6d55)"
  },
  "Уникальность Библии": {
    iconKey: "uniqueness",
    accent: "#7f9fb9",
    coverTone: "linear-gradient(145deg, #7f9fb9, #587a97)"
  },
  "Институт семьи": {
    iconKey: "family",
    accent: "#7aa370",
    coverTone: "linear-gradient(145deg, #7aa370, #5d8760)"
  },
  "Молчание Бога": {
    iconKey: "silence",
    accent: "#9c7aa9",
    coverTone: "linear-gradient(145deg, #9c7aa9, #7f5f8a)"
  },
  "Краткое содержание Библии": {
    iconKey: "summary",
    accent: "#a58f6b",
    coverTone: "linear-gradient(145deg, #a58f6b, #7f6b4f)"
  }
};

const DEFAULT_THEME: ShowcaseTheme = {
  iconKey: "default",
  accent: "#8c7b6b",
  coverTone: "linear-gradient(145deg, #8c7b6b, #6d5b4d)"
};

const CYRILLIC_MAP: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya"
};

export const getCourseSlug = (title: string) =>
  title
    .trim()
    .toLowerCase()
    .split("")
    .map((char) => CYRILLIC_MAP[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getCourseTheme = (title: string): ShowcaseTheme => COURSE_THEMES[title] ?? DEFAULT_THEME;

export const getDashboardLink = (role: UserRole | null) => `/${role ?? "student"}`;
