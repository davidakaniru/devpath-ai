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
