import { zodResolver } from "@hookform/resolvers/zod";
import { Button, LinearProgress, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { VideoPlayer } from "@/shared/ui/VideoPlayer";

const schema = z.object({
  title: z.string().min(3, "Введите название урока"),
  contentType: z.enum(["video", "text", "mixed"]),
  textContent: z.string().optional(),
  videoUrl: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => {
      if (!value) {
        return true;
      }
      if (value.startsWith("storage://")) {
        return true;
      }
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }, "Укажите корректную ссылку")
});

export type LessonFormValues = z.infer<typeof schema>;

interface LessonFormProps {
  loading?: boolean;
  onSubmit: (values: LessonFormValues) => Promise<void>;
  onUploadVideo?: (file: File, onProgress?: (percent: number) => void) => Promise<string>;
  initialValues?: Partial<LessonFormValues>;
  submitLabel?: string;
}

export const LessonForm = ({ loading, onSubmit, onUploadVideo, initialValues, submitLabel = "Сохранить урок" }: LessonFormProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<LessonFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      contentType: "video",
      title: "",
      textContent: "",
      videoUrl: ""
    }
  });

  useEffect(() => {
    reset({
      contentType: initialValues?.contentType ?? "video",
      title: initialValues?.title ?? "",
      textContent: initialValues?.textContent ?? "",
      videoUrl: initialValues?.videoUrl ?? ""
    });
  }, [initialValues, reset]);

  const videoUrlValue = watch("videoUrl");

  const handleVideoFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onUploadVideo) {
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadError(null);
      const uploadedVideoUrl = await onUploadVideo(file, setUploadProgress);
      setValue("videoUrl", uploadedVideoUrl, { shouldValidate: true, shouldDirty: true });
      setValue("contentType", "video", { shouldDirty: true });
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Ошибка загрузки видео";
      setUploadError(message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
      <TextField label="Название урока" {...register("title")} error={Boolean(errors.title)} helperText={errors.title?.message} />
      <TextField select label="Тип контента" defaultValue="video" {...register("contentType")}>
        <MenuItem value="text">Текст</MenuItem>
        <MenuItem value="video">Видео</MenuItem>
        <MenuItem value="mixed">Смешанный</MenuItem>
      </TextField>
      <TextField
        multiline
        minRows={4}
        label="Текст урока"
        {...register("textContent")}
        error={Boolean(errors.textContent)}
        helperText={errors.textContent?.message}
      />
      <TextField label="Ссылка на видео" {...register("videoUrl")} error={Boolean(errors.videoUrl)} helperText={errors.videoUrl?.message} />
      {onUploadVideo && (
        <Stack spacing={1}>
          <Button component="label" variant="outlined" disabled={loading || uploading}>
            Загрузить видео в облако
            <input type="file" hidden accept="video/*" onChange={handleVideoFileChange} />
          </Button>
          {uploading && (
            <Stack spacing={0.75}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontSize={14} color="text.secondary">
                  Загружаю файл...
                </Typography>
                <Typography fontSize={14} fontWeight={600} color="success.main">
                  {uploadProgress}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                color="success"
                sx={{
                  height: 10,
                  borderRadius: 1,
                  bgcolor: "rgba(46, 125, 50, 0.14)"
                }}
              />
            </Stack>
          )}
          {uploadError && (
            <Typography color="error" fontSize={14}>
              {uploadError}
            </Typography>
          )}
          {videoUrlValue && videoUrlValue.startsWith("storage://") && (
            <Typography fontSize={13} color="text.secondary">
              Видео сохранено в Storage: {videoUrlValue}
            </Typography>
          )}
          {videoUrlValue && (
            <Stack spacing={1}>
              <Typography fontSize={14} fontWeight={600}>
                Предпросмотр видео
              </Typography>
              <VideoPlayer videoUrl={videoUrlValue} />
            </Stack>
          )}
        </Stack>
      )}
      <Button type="submit" variant="contained" disabled={loading || uploading}>
        {submitLabel}
      </Button>
    </Stack>
  );
};
