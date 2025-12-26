import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Translate text using Gemini AI
 * @param text - Text to translate
 * @param targetLang - Target language ('vi' for Vietnamese, 'en' for English)
 * @returns Translated text
 */
export const translateWithGemini = async (
  text: string,
  targetLang: 'vi' | 'en'
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = targetLang === 'vi'
      ? `Dịch đoạn văn khoa học sau sang tiếng Việt tự nhiên, dễ hiểu cho học sinh. Giữ nguyên các thuật ngữ khoa học quan trọng (như tên nguyên tố hóa học, đơn vị đo lường). Chỉ trả về bản dịch, không giải thích thêm:\n\n${text}`
      : `Translate the following text to clear, simple English suitable for students. Keep scientific terms intact. Only return the translation:\n\n${text}`;

    const result = await model.generateContent(prompt);
    const translated = result.response.text().trim();

    // Remove markdown formatting if Gemini adds it
    return translated.replace(/```.*\n?/g, '').replace(/\*\*/g, '').trim();
  } catch (error) {
    console.error('Gemini translation failed:', error);
    return text; // Return original text if translation fails
  }
};
