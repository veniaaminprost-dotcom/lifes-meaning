const getYoutubeEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.slice(1);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
  } catch {
    return null;
  }

  return null;
};

const getVimeoEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("vimeo.com")) {
      return null;
    }
    const videoId = parsed.pathname.split("/").filter(Boolean).pop();
    return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
  } catch {
    return null;
  }
};

export const resolveEmbedUrl = (url: string) => getYoutubeEmbedUrl(url) ?? getVimeoEmbedUrl(url);
