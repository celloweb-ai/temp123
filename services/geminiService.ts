import { GoogleGenAI } from "@google/genai";

export const geminiService = {
  async getTechnicalAdvice(prompt: string, context?: string) {
    try {
      // Create a fresh client instance for each request to ensure current environment configuration
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Use gemini-3-pro-preview for complex engineering, advanced reasoning, and STEM tasks
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: `You are a world-class Oil & Gas Engineering expert at MOC Studio. 
          You specialize in Management of Change (MOC), process safety (API RP 754), and industrial standards (NR-13, API 521).
          Help engineers assess risks, write technical summaries, and follow regulatory guidelines.
          Keep responses technical, concise, and professional. Current user context: ${context || 'General query'}.`,
          temperature: 0.7,
        },
      });
      // Extract text using the .text property as per guidelines, with a fallback
      return response.text || "No technical response generated.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Unable to reach technical advisor at this moment. Please check your connectivity.";
    }
  },

  async summarizeMOC(mocDescription: string) {
    const prompt = `Please provide a professional 2-sentence technical summary and key safety considerations for the following MOC description: "${mocDescription}"`;
    return this.getTechnicalAdvice(prompt);
  }
};