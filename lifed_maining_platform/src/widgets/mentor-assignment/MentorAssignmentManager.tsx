import { Button, FormControlLabel, Paper, Stack, Switch, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { MentorAssignment, Profile } from "@/shared/types";
import { useUpdateMentorDistributionSettingsMutation } from "@/shared/api/baseApi";

interface MentorAssignmentManagerProps {
  students: Profile[];
  teachers: Profile[];
  assignments: MentorAssignment[];
  settings: { enabled: boolean; preferGender: boolean } | undefined;
}

export const MentorAssignmentManager = ({ students, teachers, assignments, settings }: MentorAssignmentManagerProps) => {
  const [autoEnabled, setAutoEnabled] = useState(settings?.enabled ?? false);
  const [preferGender, setPreferGender] = useState(settings?.preferGender ?? true);
  const [updateSettings, { isLoading: updatingSettings }] = useUpdateMentorDistributionSettingsMutation();

  useEffect(() => {
    if (!settings) {
      return;
    }
    setAutoEnabled(settings.enabled);
    setPreferGender(settings.preferGender);
  }, [settings]);

  const saveSettings = async () => {
    try {
      await updateSettings({ enabled: autoEnabled, preferGender }).unwrap();
      toast.success("Настройки автоприкрепления сохранены");
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Ошибка сохранения настроек";
      toast.error(message);
    }
  };

  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="h6">Настройки распределения студентов</Typography>
          <Typography variant="body2" color="text.secondary">
            Студенты: {students.length}. Преподаватели: {teachers.length}. Назначений: {assignments.length}. Ручное распределение находится на карточках студентов выше.
          </Typography>
        </Stack>
        <FormControlLabel
          control={<Switch checked={autoEnabled} onChange={(_, checked) => setAutoEnabled(checked)} />}
          label="Автоматическое распределение новых студентов"
        />
        <FormControlLabel
          control={<Switch checked={preferGender} onChange={(_, checked) => setPreferGender(checked)} />}
          label="Учитывать пол (девушки -> преподаватель-женщина, мужчины -> преподаватель-мужчина)"
        />
        <Button variant="outlined" onClick={saveSettings} disabled={updatingSettings}>
          Сохранить настройки распределения
        </Button>
      </Stack>
    </Paper>
  );
};
