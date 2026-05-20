import { supabase } from "@/shared/api/supabaseClient";
import { env } from "@/shared/config/env";
import * as tus from "tus-js-client";

const VIDEO_BUCKET = "course-materials";
const PUBLIC_VIDEO_BUCKETS = new Set<string>([VIDEO_BUCKET]);

const sanitizeFileName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "_");
const normalizeFileName = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const tryResolveAlternativeObjectPath = async (bucket: string, objectPath: string) => {
  const parts = objectPath.split("/");
  const rawFileName = parts.pop();
  if (!rawFileName) {
    return null;
  }

  const dir = parts.join("/");
  const lessonIndexMatch = rawFileName.match(/^(\d{1,3})[_-]/);
  const lessonIndex = lessonIndexMatch?.[1] ?? null;
  const normalizedTarget = normalizeFileName(rawFileName);

  const { data: files, error } = await supabase.storage.from(bucket).list(dir, {
    limit: 1000,
    sortBy: { column: "name", order: "asc" }
  });

  if (error || !files?.length) {
    return null;
  }

  const exact = files.find((file) => normalizeFileName(file.name) === normalizedTarget);
  if (exact) {
    return dir ? `${dir}/${exact.name}` : exact.name;
  }

  if (lessonIndex) {
    const byIndex = files.find((file) => file.name.startsWith(`${lessonIndex}_`) || file.name.startsWith(`${lessonIndex}-`));
    if (byIndex) {
      return dir ? `${dir}/${byIndex.name}` : byIndex.name;
    }
  }

  const firstMp4 = files.find((file) => file.name.toLowerCase().endsWith(".mp4"));
  if (firstMp4) {
    return dir ? `${dir}/${firstMp4.name}` : firstMp4.name;
  }

  return null;
};

export type UploadProgressHandler = (percent: number) => void;

const getStorageUploadEndpoint = () => {
  const hostname = new URL(env.supabaseUrl).hostname;
  const projectRef = hostname.split(".")[0];
  return `https://${projectRef}.storage.supabase.co/storage/v1/upload/resumable`;
};

export const uploadCourseVideo = async (courseId: string, file: File, onProgress?: UploadProgressHandler) => {
  const fileName = `${Date.now()}_${sanitizeFileName(file.name)}`;
  const path = `${courseId}/videos/${fileName}`;

  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!session?.access_token) {
    throw new Error("Нужна авторизация для загрузки видео");
  }

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: getStorageUploadEndpoint(),
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${session.access_token}`,
        "x-upsert": "false"
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: VIDEO_BUCKET,
        objectName: path,
        contentType: file.type || "video/mp4",
        cacheControl: "3600"
      },
      chunkSize: 6 * 1024 * 1024,
      onError: reject,
      onProgress: (bytesUploaded, bytesTotal) => {
        const percent = bytesTotal > 0 ? Math.min(100, Math.round((bytesUploaded / bytesTotal) * 100)) : 0;
        onProgress?.(percent);
      },
      onSuccess: () => {
        onProgress?.(100);
        resolve();
      }
    });

    upload.findPreviousUploads()
      .then((previousUploads) => {
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        upload.start();
      })
      .catch(reject);
  });

  return `storage://${VIDEO_BUCKET}/${path}`;
};

export const createSignedVideoUrl = async (storageUrl: string, expiresIn = 60 * 60) => {
  const parsed = parseStorageVideoUrl(storageUrl);
  if (!parsed) {
    return null;
  }

  if (PUBLIC_VIDEO_BUCKETS.has(parsed.bucket)) {
    const { data } = supabase.storage.from(parsed.bucket).getPublicUrl(parsed.path);
    return data.publicUrl;
  }

  const runWithTimeout = async <T,>(promise: Promise<T>, ms = 30000) => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("Превышено время ожидания подписи видео")), ms);
    });
    try {
      return await Promise.race([promise, timeout]);
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  };

  const signWithRetries = async (bucket: string, path: string) => {
    const attempts = [45000, 60000];
    let lastError: unknown = null;

    for (const timeoutMs of attempts) {
      try {
        const response = await runWithTimeout(supabase.storage.from(bucket).createSignedUrl(path, expiresIn), timeoutMs);
        return response;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error ? lastError : new Error("Не удалось подписать видео URL");
  };

  const result = await signWithRetries(parsed.bucket, parsed.path);
  const { data, error } = result;
  if (!error) {
    return data.signedUrl;
  }

  // If stored filename changed after upload, try to find best candidate in the folder.
  if (error.message?.includes("Object not found")) {
    const alternativePath = await tryResolveAlternativeObjectPath(parsed.bucket, parsed.path);
    if (alternativePath && alternativePath !== parsed.path) {
      const secondResult = await signWithRetries(parsed.bucket, alternativePath);
      const { data: altData, error: altError } = secondResult;
      if (!altError) {
        return altData.signedUrl;
      }
    }
  }

  throw error;
};

export const parseStorageVideoUrl = (videoUrl: string) => {
  if (!videoUrl.startsWith("storage://")) {
    return null;
  }

  const withoutScheme = videoUrl.slice("storage://".length);
  const slashIndex = withoutScheme.indexOf("/");
  if (slashIndex <= 0) {
    return null;
  }

  return {
    bucket: withoutScheme.slice(0, slashIndex),
    path: withoutScheme.slice(slashIndex + 1)
  };
};
