import { Alert, CircularProgress, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { createSignedVideoUrl, parseStorageVideoUrl } from "@/shared/api/storageApi";
import { resolveEmbedUrl } from "@/shared/lib/video";

interface VideoPlayerProps {
  videoUrl: string;
}

export const VideoPlayer = ({ videoUrl }: VideoPlayerProps) => {
  const isStorageSource = Boolean(parseStorageVideoUrl(videoUrl));
  const [resolvedUrl, setResolvedUrl] = useState<string>(isStorageSource ? "" : videoUrl);
  const [loading, setLoading] = useState(isStorageSource);
  const [error, setError] = useState<string | null>(null);
  const embedUrl = useMemo(() => resolveEmbedUrl(resolvedUrl), [resolvedUrl]);

  useEffect(() => {
    let cancelled = false;
    const resolveSource = async () => {
      setError(null);
      if (!isStorageSource) {
        setResolvedUrl(videoUrl);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const signed = await createSignedVideoUrl(videoUrl);
        if (!cancelled && signed) {
          setResolvedUrl(signed);
        }
      } catch (unknownError) {
        if (!cancelled) {
          const rawMessage = unknownError instanceof Error ? unknownError.message : "Не удалось загрузить видео";
          const message = rawMessage.includes("Object not found")
            ? "Видео не найдено в хранилище. Проверьте путь к файлу в уроке."
            : rawMessage;
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    resolveSource();
    return () => {
      cancelled = true;
    };
  }, [videoUrl, isStorageSource]);

  if (loading) {
    return (
      <Stack direction="row" spacing={1.5} alignItems="center">
        <CircularProgress size={20} />
        <Typography color="text.secondary">Загрузка видео...</Typography>
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (embedUrl) {
    return (
      <Stack
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid #e8e0d8",
          backgroundColor: "#000"
        }}
      >
        <iframe
          src={embedUrl}
          title="Видео урока"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{ width: "100%", minHeight: 420, border: 0 }}
        />
      </Stack>
    );
  }

  return (
    <video
      controls
      onError={() => {
        if (!loading && resolvedUrl) {
          setError("Видео не удалось загрузить. Проверьте файл в хранилище и путь урока.");
        }
      }}
      style={{ width: "100%", borderRadius: 12, border: "1px solid #e8e0d8", backgroundColor: "#000" }}
    >
      <source src={resolvedUrl} />
      Ваш браузер не поддерживает воспроизведение видео.
    </video>
  );
};
