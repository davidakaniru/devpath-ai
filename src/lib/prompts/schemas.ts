import { Type } from "@google/genai";

export const questionSchema = {
  type: Type.OBJECT,
  properties: {
    questionNumber: { type: Type.INTEGER },
    difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] },
    category: { type: Type.STRING },
    question: { type: Type.STRING },
    options: {
      type: Type.OBJECT,
      properties: {
        A: { type: Type.STRING },
        B: { type: Type.STRING },
        C: { type: Type.STRING },
        D: { type: Type.STRING },
      },
      required: ["A", "B", "C", "D"],
    },
    correctOption: { type: Type.STRING, enum: ["A", "B", "C", "D"] },
  },
  required: [
    "questionNumber",
    "difficulty",
    "category",
    "question",
    "options",
    "correctOption",
  ],
};

export const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    overallLevel: {
      type: Type.STRING,
      enum: [
        "Beginner",
        "Early Intermediate",
        "Intermediate",
        "Advanced Intermediate",
        "Senior Ready",
      ],
    },
    overallScore: { type: Type.INTEGER },
    confidenceProfile: { type: Type.STRING },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
    categoryScores: {
      type: Type.OBJECT,
      properties: {
        fundamentals: { type: Type.INTEGER },
        debugging: { type: Type.INTEGER },
        performance: { type: Type.INTEGER },
        architecture: { type: Type.INTEGER },
        security: { type: Type.INTEGER },
      },
      required: [
        "fundamentals",
        "debugging",
        "performance",
        "architecture",
        "security",
      ],
    },
    recommendedPath: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          priority: { type: Type.INTEGER },
          reason: { type: Type.STRING },
        },
        required: ["title", "priority", "reason"],
      },
    },
    summary: { type: Type.STRING },
  },
  required: [
    "overallLevel",
    "overallScore",
    "confidenceProfile",
    "strengths",
    "weaknesses",
    "categoryScores",
    "recommendedPath",
    "summary",
  ],
};
