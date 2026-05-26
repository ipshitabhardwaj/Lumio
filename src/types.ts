export interface Step {
  number: number;
  title: string;
  explanation: string;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface MCQ {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface ShortAnswer {
  question: string;
  sampleCorrectAnswer: string;
  explanation: string;
}

export interface Quiz {
  mcqs: MCQ[];
  shortAnswers: ShortAnswer[];
}

export interface SolutionResponse {
  subject: string;
  topic: string;
  problemSummary: string;
  steps: Step[];
  finalAnswer: string;
  simpleExplanation: string;
  commonMistakes: string[];
  flashcards: Flashcard[];
  quiz: Quiz;
  difficulty: "Easy" | "Medium" | "Hard";
  studyTips: string[];
}

export interface GradingResponse {
  score: number; // 0 to 10 scale
  feedback: string;
  strengths: string;
  suggestions: string;
}
