import { GoogleGenAI } from "@google/genai";
import type { DocumentSummary } from "@shared/schema";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "AIzaSyAisfDDYrllCnnmmZZpZ0yqaaIZJrdXfpg"
});

export interface TextEnhancementResult {
  enhancedText: string;
  summary: string;
  documentType: string;
  improvements: string[];
}

export class GeminiService {
  async enhanceText(text: string, level: 'basic' | 'standard' | 'advanced' = 'standard'): Promise<TextEnhancementResult> {
    try {
      const prompt = this.getEnhancementPrompt(text, level);
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              enhancedText: { type: "string" },
              summary: { type: "string" },
              documentType: { type: "string" },
              improvements: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["enhancedText", "summary", "documentType", "improvements"]
          }
        },
        contents: prompt
      });

      const result = JSON.parse(response.text || "{}");
      return result as TextEnhancementResult;
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error(`Failed to enhance text: ${error}`);
    }
  }

  async processTextChunk(chunk: string, chunkIndex: number, totalChunks: number): Promise<string> {
    try {
      const prompt = `You are an expert document processor. Enhance and format this text chunk (${chunkIndex + 1}/${totalChunks}) while maintaining its original meaning and structure:

INSTRUCTIONS:
- Fix any OCR errors or formatting issues
- Maintain proper paragraph structure
- Preserve numbered lists and bullet points
- Keep all original content intact
- Ensure consistent formatting
- Fix spacing and line breaks
- Preserve footnote references

TEXT CHUNK:
${chunk}

Return only the enhanced text, no additional commentary.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      return response.text || chunk;
    } catch (error) {
      console.error(`Error processing chunk ${chunkIndex}:`, error);
      return chunk; // Return original if processing fails
    }
  }

  async generateSummary(text: string): Promise<DocumentSummary> {
    try {
      const prompt = `Analyze this document and provide a comprehensive summary:

${text.substring(0, 10000)}...

Provide analysis in JSON format with:
- documentType: Type of document (e.g., "Legal Agreement", "Research Paper", etc.)
- aiSummary: 2-3 sentence summary of the document's main content and purpose

Focus on identifying the document type and creating a concise but informative summary.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              documentType: { type: "string" },
              aiSummary: { type: "string" }
            },
            required: ["documentType", "aiSummary"]
          }
        },
        contents: prompt
      });

      const result = JSON.parse(response.text || "{}");
      
      return {
        documentType: result.documentType || "Unknown Document",
        aiSummary: result.aiSummary || "Document analysis completed.",
        totalPages: 0, // Will be set by caller
        wordCount: 0, // Will be set by caller
        processingTime: "0:00" // Will be set by caller
      };
    } catch (error) {
      console.error("Error generating summary:", error);
      return {
        documentType: "Unknown Document",
        aiSummary: "Summary generation failed.",
        totalPages: 0,
        wordCount: 0,
        processingTime: "0:00"
      };
    }
  }

  private getEnhancementPrompt(text: string, level: string): string {
    const basePrompt = `You are an expert document processor specializing in text enhancement and formatting.`;
    
    const levelInstructions = {
      basic: "Apply basic formatting improvements: fix obvious errors, standardize spacing, and ensure consistent paragraph structure.",
      standard: "Apply comprehensive formatting: fix OCR errors, improve structure, standardize formatting, organize content logically, and enhance readability.",
      advanced: "Apply advanced analysis: deep structural improvements, content organization, footnote management, and sophisticated formatting enhancements."
    };

    return `${basePrompt}

Enhancement Level: ${level.toUpperCase()}
Instructions: ${levelInstructions[level as keyof typeof levelInstructions]}

Text to enhance:
${text}

Provide your response in JSON format with:
- enhancedText: The improved and formatted text
- summary: A brief summary of the document
- documentType: The type of document (e.g., "Legal Agreement", "Research Paper")
- improvements: Array of specific improvements made

Ensure the enhanced text maintains all original content while improving formatting and readability.`;
  }
}

export const geminiService = new GeminiService();
