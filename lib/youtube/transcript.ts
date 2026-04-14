import { YoutubeTranscript } from "youtube-transcript";

/**
 * Get the transcript of a YouTube video.
 * Prioritizes Spanish subtitles.
 */
export async function getVideoTranscript(videoId: string): Promise<string> {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "es",
    });

    if (!transcript || transcript.length === 0) {
      return "";
    }

    // Combine all transcript segments into a single text
    const fullText = transcript.map((seg) => seg.text).join(" ");

    // Clean up the text
    return cleanTranscript(fullText);
  } catch {
    // Try without language specification as fallback
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      if (!transcript || transcript.length === 0) return "";
      const fullText = transcript.map((seg) => seg.text).join(" ");
      return cleanTranscript(fullText);
    } catch {
      return "";
    }
  }
}

function cleanTranscript(text: string): string {
  return text
    .replace(/\[.*?\]/g, "") // Remove [Music], [Applause], etc.
    .replace(/\s+/g, " ")
    .replace(/(.{1,}?)\1{3,}/g, "$1") // Remove excessive repetitions
    .trim();
}
