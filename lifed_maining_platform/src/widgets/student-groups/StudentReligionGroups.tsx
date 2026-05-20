import { Button, Chip, Divider, Link, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { MentorAssignment, Profile } from "@/shared/types";
import { useUpsertMentorAssignmentMutation } from "@/shared/api/baseApi";

interface StudentReligionGroupsProps {
  students: Profile[];
  title?: string;
  teachers?: Profile[];
  assignments?: MentorAssignment[];
  canAssignMentor?: boolean;
}

type SegmentKey = "unchurched" | "christian" | "muslim";

const segmentMeta: Record<SegmentKey, { title: string; subtitle: string }> = {
  unchurched: {
    title: "Невоцерковленные / в поиске",
    subtitle: "Атеисты, другое, не указали"
  },
  christian: {
    title: "Укрепившиеся в вере",
    subtitle: "Христиане (по направлениям)"
  },
  muslim: {
    title: "Мусульмане",
    subtitle: "Отдельная группа сопровождения"
  }
};

const relationLabel = (student: Profile) => {
  if (student.religionRelation === "atheist") return "Атеист";
  if (student.religionRelation === "muslim") return "Мусульманин";
  if (student.religionRelation === "other") return student.religionOther?.trim() || "Другое";
  if (student.religionRelation === "christian") {
    if (student.christianBranch === "orthodox") return "Христианин: православный";
    if (student.christianBranch === "catholic") return "Христианин: католик";
    if (student.christianBranch === "protestant") {
      return student.christianConfession?.trim()
        ? `Христианин: протестант (${student.christianConfession.trim()})`
        : "Христианин: протестант";
    }
    return "Христианин";
  }
  return "Не указано";
};

const getSegment = (student: Profile): SegmentKey => {
  if (student.religionRelation === "christian") return "christian";
  if (student.religionRelation === "muslim") return "muslim";
  return "unchurched";
};

const toMessengerHref = (student: Profile) => {
  const raw = student.messengerContact?.trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;

  const normalized = raw.startsWith("@") ? raw.slice(1) : raw;
  if (student.messengerType === "telegram") return `https://t.me/${normalized}`;
  if (student.messengerType === "max") return `https://max.ru/${normalized}`;
  if (student.messengerType === "vk") return `https://vk.com/${normalized}`;
  return null;
};

const groupBySegment = (students: Profile[]) => {
  const groups: Record<SegmentKey, Profile[]> = {
    unchurched: [],
    christian: [],
    muslim: []
  };

  for (const student of students) {
    groups[getSegment(student)].push(student);
  }

  return groups;
};

const escapeCsvCell = (value: string | null | undefined) => {
  const normalized = value ?? "";
  const escaped = normalized.replace(/\"/g, "\"\"");
  return `"${escaped}"`;
};

const religionExportLabel = (student: Profile) => relationLabel(student);

const exportGroupCsv = (students: Profile[], fileLabel: string) => {
  const header = [
    "Имя",
    "Email/ID",
    "Телефон",
    "Мессенджер",
    "Контакт мессенджера",
    "Религиозная группа"
  ];

  const rows = students.map((student) => [
    student.displayName,
    student.userId,
    student.phone ?? "",
    student.messengerType ?? "",
    student.messengerContact ?? "",
    religionExportLabel(student)
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\n");

  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `students-${fileLabel}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const StudentReligionGroups = ({
  students,
  title = "Сегментация студентов по религиозным группам",
  teachers = [],
  assignments = [],
  canAssignMentor = false
}: StudentReligionGroupsProps) => {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [draftMentors, setDraftMentors] = useState<Record<string, string>>({});
  const [upsertAssignment, { isLoading: assigning }] = useUpsertMentorAssignmentMutation();

  const assignmentsMap = useMemo(() => {
    const map = new Map<string, MentorAssignment>();
    assignments.forEach((assignment) => map.set(assignment.studentId, assignment));
    return map;
  }, [assignments]);

  const teacherName = (teacherId: string | null | undefined) => {
    if (!teacherId) return "Не назначен";
    const teacher = teachers.find((item) => item.userId === teacherId);
    return teacher?.displayName ?? teacherId.slice(0, 8);
  };

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) => {
      const haystack = [
        student.displayName,
        student.phone,
        student.messengerType,
        student.messengerContact,
        relationLabel(student),
        teacherName(assignmentsMap.get(student.userId)?.mentorId)
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [assignmentsMap, search, students, teachers]);

  const visibleStudents = expanded ? filteredStudents : filteredStudents.slice(0, 3);
  const hiddenCount = Math.max(filteredStudents.length - visibleStudents.length, 0);

  const assignMentor = async (studentId: string) => {
    const mentorId = draftMentors[studentId] ?? assignmentsMap.get(studentId)?.mentorId ?? "";
    if (!mentorId) {
      toast.error("Выберите преподавателя");
      return;
    }

    try {
      await upsertAssignment({ studentId, mentorId, assignmentMode: "manual" }).unwrap();
      toast.success("Студент распределён к преподавателю");
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Ошибка распределения студента";
      toast.error(message);
    }
  };

  if (!students.length) {
    return (
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h6">{title}</Typography>
        <Typography color="text.secondary">Пока нет студентов.</Typography>
      </Paper>
    );
  }

  const groups = groupBySegment(visibleStudents);

  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap>
          <Stack spacing={0.4}>
            <Typography variant="h6">{title}</Typography>
            <Typography variant="body2" color="text.secondary">
              Показано {visibleStudents.length} из {filteredStudents.length}. Поиск работает по имени, телефону, мессенджеру, группе и преподавателю.
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            size="small"
            onClick={() => exportGroupCsv(students, "all")}
          >
            Экспорт всех в CSV
          </Button>
        </Stack>
        <TextField
          size="small"
          label="Поиск студента"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setExpanded(false);
          }}
          placeholder="Имя, телефон, Telegram, преподаватель..."
        />
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {(Object.keys(segmentMeta) as SegmentKey[]).map((segment) => (
            <Chip
              key={segment}
              color={segment === "christian" ? "success" : segment === "unchurched" ? "warning" : "info"}
              label={`${segmentMeta[segment].title}: ${groupBySegment(filteredStudents)[segment].length}`}
            />
          ))}
        </Stack>
        {!filteredStudents.length && (
          <Typography color="text.secondary">По этому запросу студентов не найдено.</Typography>
        )}
        {(Object.keys(segmentMeta) as SegmentKey[]).map((segment, index) => (
          <Stack key={segment} spacing={1.25}>
            {index > 0 && <Divider />}
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap>
              <Stack spacing={0.25}>
                <Typography variant="subtitle1">{segmentMeta[segment].title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {segmentMeta[segment].subtitle}
                </Typography>
              </Stack>
              <Button
                variant="text"
                size="small"
                disabled={!groups[segment].length}
                onClick={() => exportGroupCsv(groups[segment], segment)}
              >
                Экспорт группы CSV
              </Button>
            </Stack>
            {!groups[segment].length && (
              <Typography variant="body2" color="text.secondary">
                В этой группе пока нет студентов.
              </Typography>
            )}
            {groups[segment].map((student) => {
              const messengerHref = toMessengerHref(student);
              const phoneHref = student.phone ? `tel:${student.phone.replace(/[^\d+]/g, "")}` : null;
              const currentMentorId = assignmentsMap.get(student.userId)?.mentorId ?? "";
              return (
                <Paper key={student.userId} variant="outlined" sx={{ p: 1.5 }}>
                  <Stack spacing={0.75}>
                    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.25}>
                      <Stack spacing={0.35}>
                        <Typography fontWeight={600}>{student.displayName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {relationLabel(student)}
                        </Typography>
                        {canAssignMentor && (
                          <Typography variant="body2" color="text.secondary">
                            Текущий преподаватель: {teacherName(currentMentorId)}
                          </Typography>
                        )}
                      </Stack>
                      {canAssignMentor && (
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                          <Select
                            size="small"
                            displayEmpty
                            value={draftMentors[student.userId] ?? currentMentorId}
                            onChange={(event) =>
                              setDraftMentors((prev) => ({ ...prev, [student.userId]: event.target.value as string }))
                            }
                            sx={{ minWidth: { xs: "100%", sm: 240 } }}
                          >
                            <MenuItem value="">Выберите преподавателя</MenuItem>
                            {teachers.map((teacher) => (
                              <MenuItem key={teacher.userId} value={teacher.userId}>
                                {teacher.displayName}
                              </MenuItem>
                            ))}
                          </Select>
                          <Button variant="contained" onClick={() => assignMentor(student.userId)} disabled={assigning || !teachers.length}>
                            Распределить
                          </Button>
                        </Stack>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                      {messengerHref && (
                        <Link href={messengerHref} target="_blank" rel="noopener noreferrer" underline="hover">
                          {student.messengerType?.toUpperCase() ?? "Мессенджер"}: {student.messengerContact}
                        </Link>
                      )}
                      {phoneHref && (
                        <Link href={phoneHref} underline="hover">
                          Телефон: {student.phone}
                        </Link>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        ))}
        {filteredStudents.length > 3 && (
          <>
            <Divider />
            <Button variant="text" onClick={() => setExpanded((value) => !value)}>
              {expanded ? "Свернуть список" : `Развернуть весь список (${hiddenCount} ещё)`}
            </Button>
          </>
        )}
      </Stack>
    </Paper>
  );
};
