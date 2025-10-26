/**
 * Victory and AI Companion Types
 */

export type VictoryPhase =
    | "none"
    | "celebration"
    | "launch"
    | "travel"
    | "arrival"
    | "ai-intro"
    | "complete";

export type AIPersonality = "scientific" | "friendly" | "mysterious";

export interface AIDialogue {
    intro: string[];
    performanceBased: {
        highScore: string;
        noDamage: string;
        highCombo: string;
        default: string;
    };
    facts: string[];
    explore: string;
}

export interface AICompanionData {
    id: string;
    name: string;
    title: string;
    personality: AIPersonality;
    color: string; // Hologram color
    avatar: string; // Emoji or icon
    dialogues: AIDialogue;
}

export interface VictoryStats {
    score: number;
    maxCombo: number;
    accuracy: number; // hits / shots
    damagesTaken: number;
    timeElapsed: number;
}
