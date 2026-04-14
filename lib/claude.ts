import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateWithClaude(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt,
    generationConfig: {
      maxOutputTokens: 4096,
      temperature: 0.7,
    },
  });

  const result = await model.generateContent(userPrompt);
  return result.response.text();
}
