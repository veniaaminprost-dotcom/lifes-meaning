import { Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { toast } from "sonner";
import { useLessonChatMessagesQuery, useSendLessonChatMessageMutation } from "@/shared/api/baseApi";

interface LessonChatProps {
  lessonId: string;
  courseId: string;
  studentId: string;
  mentorId: string | null;
  canWrite: boolean;
}

export const LessonChat = ({ lessonId, courseId, studentId, mentorId, canWrite }: LessonChatProps) => {
  const [messageText, setMessageText] = useState("");
  const { data: messages = [] } = useLessonChatMessagesQuery(
    { lessonId, studentId },
    { skip: !lessonId || !studentId }
  );
  const [sendMessage, { isLoading }] = useSendLessonChatMessageMutation();

  const handleSend = async () => {
    if (!mentorId) {
      toast.error("Преподаватель пока не назначен.");
      return;
    }

    if (!messageText.trim()) {
      toast.error("Введите сообщение.");
      return;
    }

    try {
      await sendMessage({
        lessonId,
        courseId,
        studentId,
        mentorId,
        messageText
      }).unwrap();
      setMessageText("");
      toast.success("Сообщение отправлено");
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Не удалось отправить сообщение";
      toast.error(message);
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6">Чат под уроком</Typography>
          <Typography color="text.secondary">
            Здесь студент и закреплённый преподаватель обсуждают развернутый ответ. Директор видит переписку для контроля качества.
          </Typography>
          <Stack spacing={1} sx={{ maxHeight: 320, overflow: "auto" }}>
            {!messages.length && <Typography color="text.secondary">Сообщений пока нет.</Typography>}
            {messages.map((message) => (
              <Stack
                key={message.id}
                spacing={0.35}
                sx={{
                  alignSelf: message.authorId === studentId ? "flex-end" : "flex-start",
                  maxWidth: "86%",
                  p: 1.25,
                  border: "1px solid #e8e0d8",
                  borderRadius: 1.5,
                  bgcolor: message.authorId === studentId ? "rgba(56, 122, 105, 0.08)" : "background.paper"
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  {message.authorName}
                </Typography>
                <Typography>{message.messageText}</Typography>
              </Stack>
            ))}
          </Stack>
          {canWrite && (
            <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
              <TextField
                fullWidth
                size="small"
                label="Сообщение"
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
              />
              <Button variant="contained" onClick={handleSend} disabled={isLoading || !mentorId}>
                Отправить
              </Button>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
