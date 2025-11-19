import { GoogleGenAI, Type } from "@google/genai";
import { AIParseResult, EventCategory } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const parseContentToEvents = async (
  textInput: string,
  currentDate: Date,
  fileData?: { mimeType: string; data: string } // base64 data
): Promise<AIParseResult> => {
  
  const nowISO = currentDate.toISOString();
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const systemInstruction = `
    You are an intelligent calendar assistant. Your goal is to extract calendar event details from the user's input (text and/or files like images or PDFs of syllabi/schedules).
    
    Current Context:
    - Current Reference Date/Time: ${nowISO}
    - User Timezone: ${userTimeZone}
    
    Instructions:
    1. Analyze the input for event title, start time, end time, location, and description.
    2. IMPORTANT: Return a LIST of events. If a file contains a schedule (e.g., a syllabus), extract ALL events found.
    3. Categorize events into 'Business', 'Student', 'Personal', or 'Other'.
    4. If duration is not specified, assume 1 hour.
    5. If dates are relative (e.g., "Tuesday"), calculate exact ISO strings based on Current Reference Date.
    6. ACT AS A JUDGE: Evaluate your extraction. Give a confidence score and reasoning.
  `;

  try {
    const parts: any[] = [];
    
    if (fileData) {
      parts.push({
        inlineData: {
          mimeType: fileData.mimeType,
          data: fileData.data
        }
      });
    }
    
    if (textInput) {
      parts.push({ text: textInput });
    }

    if (parts.length === 0) {
      throw new Error("No content provided");
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Supports multimodal input
      contents: { parts },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            events: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  start: { type: Type.STRING, description: "ISO 8601 date string" },
                  end: { type: Type.STRING, description: "ISO 8601 date string" },
                  description: { type: Type.STRING },
                  location: { type: Type.STRING },
                  category: { type: Type.STRING, enum: [EventCategory.Business, EventCategory.Student, EventCategory.Personal, EventCategory.Other] }
                },
                required: ["title", "start", "end", "category"]
              }
            },
            judgement: {
              type: Type.OBJECT,
              properties: {
                confidenceScore: { type: Type.INTEGER },
                reasoning: { type: Type.STRING },
                ambiguityDetected: { type: Type.BOOLEAN },
                suggestions: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING } 
                }
              },
              required: ["confidenceScore", "reasoning", "ambiguityDetected"]
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIParseResult;

  } catch (error) {
    console.error("Error parsing event with AI:", error);
    throw error;
  }
};