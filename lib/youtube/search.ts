interface VideoResult {
  videoId: string;
  title: string;
  url: string;
}

/**
 * Search YouTube for videos related to field service / preaching.
 * Uses YouTube Data API v3.
 */
export async function searchYouTubeVideos(
  query: string,
  maxResults: number = 3
): Promise<VideoResult[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn("YouTube API key not configured");
    return [];
  }

  try {
    const params = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      maxResults: String(maxResults),
      relevanceLanguage: "es",
      order: "date",
      key: apiKey,
    });

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`
    );

    if (!res.ok) return [];

    const data = (await res.json()) as {
      items: Array<{
        id: { videoId: string };
        snippet: { title: string };
      }>;
    };

    return (data.items || []).map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
  } catch {
    return [];
  }
}
