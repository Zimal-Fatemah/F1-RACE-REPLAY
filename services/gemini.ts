import { GoogleGenAI } from "@google/genai";
import { CarState, Driver } from "../types";

// Initialize Gemini
// Note: In a real app, strict checks for API key would be here.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateRaceAnalysis = async (
  prompt: string,
  cars: CarState[],
  drivers: Driver[],
  raceTime: number
): Promise<string> => {
  if (!apiKey) {
    return "API Key not configured. Please check your environment variables.";
  }

  // Create context from current race state
  const leaderboard = cars
    .sort((a, b) => b.lapProgress + b.lap - (a.lapProgress + a.lap)) // Simple sort
    .map((c, i) => {
      const driver = drivers.find(d => d.id === c.driverId);
      return `${i + 1}. ${driver?.name} (Lap ${c.lap}, Speed: ${c.speed.toFixed(0)} km/h)`;
    })
    .join('\n');

  const context = `
    Current Race Time: ${raceTime.toFixed(1)}s
    Leaderboard:
    ${leaderboard}
    
    System Instruction: You are an expert Formula 1 Race Engineer. 
    Analyze the user's question based on the provided live telemetry context. 
    Keep answers concise, technical but accessible, and immersive. 
    If the user asks about strategy, use the tire data and lap times (simulate realistic advice).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { text: context },
        { text: prompt }
      ]
    });
    
    return response.text || "Radio check failed. Please repeat.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Connection to pit wall lost. (API Error)";
  }
};