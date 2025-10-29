// Quiz System Types

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number; // Index of correct answer (0-3)
    explanation: string; // Explanation shown after answering
    difficulty: "easy" | "medium" | "hard";
    category: "geography" | "science" | "history" | "fun";
}

export interface PlanetQuiz {
    planetId: string;
    planetName: string;
    questions: QuizQuestion[];
    passingScore: number; // Minimum score to pass
    rewards: {
        bronze: {
            score: number; // 1-2 correct
            title: string;
            badges: string[];
            message: string;
        };
        silver: {
            score: number; // 3-4 correct
            title: string;
            badges: string[];
            message: string;
        };
        gold: {
            score: number; // 5 correct
            title: string;
            badges: string[];
            message: string;
        };
    };
}

export interface QuizResult {
    planetId: string;
    score: number;
    maxScore: number;
    percentage: number;
    tier: "bronze" | "silver" | "gold";
    completedAt: Date;
    answers: {
        questionId: string;
        selectedAnswer: number;
        isCorrect: boolean;
    }[];
}

export interface QuizProgress {
    currentQuestion: number;
    totalQuestions: number;
    correctAnswers: number;
}
