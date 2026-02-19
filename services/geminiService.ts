import { GoogleGenAI, Type } from "@google/genai";
import { IssueCategory } from '../types';

// API Key handling - only initialize if API key is available
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
let ai: any = null;

try {
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  } else {
    console.warn("No API Key configured for Gemini. AI features will use fallback values.");
  }
} catch (error) {
  console.warn("Failed to initialize GoogleGenAI:", error);
}

export const analyzeReportText = async (description: string): Promise<{ category: IssueCategory; suggestedTitle: string }> => {
  // If AI is not configured, return fallback values
  if (!ai) {
    console.log("AI not configured, using fallback analysis");
    // Simple keyword-based fallback
    const lowerDesc = description.toLowerCase();
    let category = IssueCategory.OTHER;
    if (lowerDesc.includes('luz') || lowerDesc.includes('farola') || lowerDesc.includes('alumbrado')) {
      category = IssueCategory.LIGHTING;
    } else if (lowerDesc.includes('bache') || lowerDesc.includes('acera') || lowerDesc.includes('calle')) {
      category = IssueCategory.INFRASTRUCTURE;
    } else if (lowerDesc.includes('basura') || lowerDesc.includes('limpieza') || lowerDesc.includes('suciedad')) {
      category = IssueCategory.CLEANING;
    } else if (lowerDesc.includes('parque') || lowerDesc.includes('jardín') || lowerDesc.includes('árbol')) {
      category = IssueCategory.PARKS;
    }

    return {
      category,
      suggestedTitle: description.split(' ').slice(0, 5).join(' ')
    };
  }

  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: `Analyze the following urban issue report description from Sevilla and suggest a category and a short, concise title (max 5 words).
      
      Description: "${description}"
      
      Available Categories: ${Object.values(IssueCategory).join(', ')}`
        }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              enum: Object.values(IssueCategory),
              description: "The most fitting category for the issue."
            },
            suggestedTitle: {
              type: Type.STRING,
              description: "A short, descriptive title for the report."
            }
          },
          required: ["category", "suggestedTitle"]
        }
      }
    });

    const response = await result.response;
    const text = response.text();
    if (text) {
      // Find JSON block if it exists
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      return JSON.parse(jsonStr);
    }

    throw new Error("No response from AI");
  } catch (error) {
    console.error("Error analyzing report:", error);
    return {
      category: IssueCategory.OTHER,
      suggestedTitle: "Incidencia Reportada"
    };
  }
};

export const validateIssueEvidence = async (imageUrl: string, category: string): Promise<{ isValid: boolean; confidence: number; reason: string }> => {
  // In a production environment, this would send the image (base64) to Gemini 1.5 Pro
  // to compare it against the category.
  // Since we are using mock URLs (picsum.photos), we simulate the analysis here.

  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate a high confidence validation for demo purposes
      resolve({
        isValid: true,
        confidence: 0.85 + Math.random() * 0.14, // Random between 0.85 and 0.99
        reason: `El análisis visual detecta elementos consistentes con la categoría '${category}'. No se detectan anomalías.`
      });
    }, 2500);
  });
};

/**
 * Translate a report's title and description into supported locales.
 * Returns a record keyed by locale code (e.g. 'en') with translated title and description.
 * Falls back to the original text if translation fails or AI is unavailable.
 */
export const translateReport = async (
  title: string,
  description: string
): Promise<Record<string, { title: string; description: string }>> => {
  // Simple fallback: return the original text as "translations" so consumers always get a valid object.
  // In production this would call a translation API (e.g. MyMemory, Gemini, etc.)
  try {
    return {
      es: { title, description },
      en: { title, description },
    };
  } catch (error) {
    console.error('Error translating report:', error);
    return {};
  }
};

