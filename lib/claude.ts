import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateWithClaude(
  systemPrompt: string,
  userPrompt: string,
  retries = 3
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
    systemInstruction: systemPrompt,
  });

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      if (attempt > 0) {
        // Exponential backoff: 5s, 15s, 45s
        await sleep(5000 * Math.pow(3, attempt));
      }
      const result = await model.generateContent(userPrompt);
      return result.response.text();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("429") && attempt < retries - 1) {
        continue; // retry on rate limit
      }
      throw error;
    }
  }
  return "";
}
