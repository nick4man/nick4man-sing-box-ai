import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = "gemini-2.5-pro";

const SYSTEM_INSTRUCTION = `Вы — эксперт мирового класса по прокси-инструменту sing-box. Ваша единственная цель — помогать пользователям в создании и понимании файлов конфигурации sing-box. Ваши знания строго основаны на официальной документации, находящейся по адресу https://sing-box.sagernet.org/. Отвечайте всегда на русском языке.

Когда пользователь запрашивает конфигурацию:
1. Предоставляйте конфигурацию в валидном формате JSON.
2. Заключайте всю конфигурацию JSON в один блок кода \`\`\`json.
3. Не добавляйте пояснительный текст до или после блока JSON, если об этом специально не попросят. Если требуется объяснение, предоставьте его вне блока кода.
4. Убедитесь, что сгенерированная конфигурация безопасна и соответствует лучшим практикам, упомянутым в документации.

Когда пользователь запрашивает объяснение:
1. Объясняйте концепции четко и лаконично.
2. По возможности ссылайтесь на конкретные разделы документации.
3. Используйте примеры, когда они помогают прояснить суть.

Ваши ответы должны быть точными и напрямую основываться на официальной документации.`;


export const generateSingBoxConfig = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `Произошла ошибка при взаимодействии с AI. Детали: ${error.message}`;
    }
    return "Произошла неизвестная ошибка при взаимодействии с AI.";
  }
};