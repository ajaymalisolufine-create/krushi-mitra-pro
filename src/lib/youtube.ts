const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

const sanitizeYouTubeId = (value: string | null | undefined): string | null => {
  if (!value) return null;

  const trimmed = value.trim();
  return YOUTUBE_ID_REGEX.test(trimmed) ? trimmed : null;
};

export const extractYouTubeId = (url: string | null): string | null => {
  if (!url) return null;

  const trimmedUrl = url.trim();
  const directId = sanitizeYouTubeId(trimmedUrl);

  if (directId) {
    return directId;
  }

  try {
    const parsedUrl = new URL(trimmedUrl);
    const hostname = parsedUrl.hostname.replace(/^www\./, '');
    const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);

    if (hostname === 'youtu.be') {
      return sanitizeYouTubeId(pathSegments[0]);
    }

    if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(hostname)) {
      const watchId = sanitizeYouTubeId(parsedUrl.searchParams.get('v'));
      if (watchId) return watchId;

      if (['shorts', 'embed', 'live', 'v'].includes(pathSegments[0] ?? '')) {
        return sanitizeYouTubeId(pathSegments[1]);
      }

      const nestedPath = parsedUrl.searchParams.get('u') ?? parsedUrl.searchParams.get('url');
      if (nestedPath) {
        const nestedUrl = nestedPath.startsWith('http') ? nestedPath : `https://youtube.com${nestedPath}`;
        const nestedId = extractYouTubeId(decodeURIComponent(nestedUrl));
        if (nestedId) return nestedId;
      }
    }
  } catch {
    // Fall back to regex-based parsing for malformed or partial URLs.
  }

  const fallbackPatterns = [
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /\/(?:shorts|embed|live|v)\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of fallbackPatterns) {
    const match = trimmedUrl.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
};

export const getYouTubeWatchUrl = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`;

export const getYouTubeEmbedUrl = (videoId: string) =>
  `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`;