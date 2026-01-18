import { GoogleGenAI, Type } from "@google/genai";
import { IssueCategory } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeReportText = async (description: string): Promise<{ category: IssueCategory; suggestedTitle: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following urban issue report description from Sevilla and suggest a category and a short, concise title (max 5 words).
      
      Description: "${description}"
      
      Available Categories: ${Object.values(IssueCategory).join(', ')}`,
      config: {
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

    if (response.text) {
      return JSON.parse(response.text);
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