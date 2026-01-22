import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MeetingAnalysis } from '../types';

const apiKey = process.env.API_KEY || '';
// Initialize conditionally to avoid immediate crash if key is missing
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A professional executive summary of the meeting.",
    },
    action_items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          task: { type: Type.STRING },
          owner: { type: Type.STRING },
        },
        required: ["task", "owner"],
      },
      description: "A list of actionable tasks derived from the notes.",
    },
    suggestions: {
      type: Type.STRING,
      description: "One strategic insight, risk identification, or growth opportunity based on the discussion.",
    },
  },
  required: ["summary", "action_items", "suggestions"],
};

// Mock response for demo mode
const MOCK_ANALYSIS: MeetingAnalysis = {
  summary: "[DEMO] The team discussed Q3 pipeline targets and identified a need for two new SDR hires. Client acquisition costs have decreased by 15%, but retention in the SMB sector is a concern.",
  action_items: [
    { task: "Draft job description for SDR roles", owner: "Sarah" },
    { task: "Prepare SMB retention analysis report", owner: "Mike" },
    { task: "Schedule sync with Marketing regarding lead quality", owner: "Jessica" }
  ],
  suggestions: "Consider implementing a 'Customer Health Score' metric for SMB clients to preemptively identify churn risks."
};

export const generateMeetingReport = async (rawNotes: string): Promise<MeetingAnalysis> => {
  // Fallback to mock data if no key is provided
  if (!apiKey || !ai) {
    console.warn("Gemini API Key missing. Returning demo data.");
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return MOCK_ANALYSIS;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: rawNotes,
      config: {
        systemInstruction: "You are a Business Development Consultant. Analyze these raw meeting notes.",
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as MeetingAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback to mock on error as well for resilience
    alert("Gemini API Error (Check Console). Loading demo data.");
    return MOCK_ANALYSIS;
  }
};