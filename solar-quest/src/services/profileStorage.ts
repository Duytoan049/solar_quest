import type { PlanetProfile } from "@/types/profile";
import type { QuizResult } from "@/types/quiz";

// LocalStorage keys
const PROFILE_KEY_PREFIX = "planet-profile-";
const QUIZ_KEY_PREFIX = "quiz-";
const MINIGAME_COMPLETED_KEY = "minigame-completed-";

/**
 * Save planet profile to localStorage
 */
export function saveProfile(profile: PlanetProfile): void {
    try {
        const key = `${PROFILE_KEY_PREFIX}${profile.planetId}`;
        localStorage.setItem(key, JSON.stringify(profile));
    } catch (error) {
        console.error("Failed to save profile:", error);
    }
}

/**
 * Get planet profile from localStorage
 */
export function getProfile(planetId: string): PlanetProfile | null {
    try {
        const key = `${PROFILE_KEY_PREFIX}${planetId}`;
        const data = localStorage.getItem(key);
        if (!data) return null;

        const profile = JSON.parse(data);
        // Convert date strings back to Date objects
        profile.createdAt = new Date(profile.createdAt);
        profile.lastVisited = new Date(profile.lastVisited);
        return profile;
    } catch (error) {
        console.error("Failed to load profile:", error);
        return null;
    }
}

/**
 * Update last visited timestamp
 */
export function updateLastVisited(planetId: string): void {
    const profile = getProfile(planetId);
    if (profile) {
        profile.lastVisited = new Date();
        saveProfile(profile);
    }
}

/**
 * Get all profiles
 */
export function getAllProfiles(): PlanetProfile[] {
    const profiles: PlanetProfile[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(PROFILE_KEY_PREFIX)) {
            const planetId = key.replace(PROFILE_KEY_PREFIX, "");
            const profile = getProfile(planetId);
            if (profile) {
                profiles.push(profile);
            }
        }
    }

    return profiles.sort(
        (a, b) => b.lastVisited.getTime() - a.lastVisited.getTime()
    );
}

/**
 * Get quiz result for a planet
 */
export function getQuizResult(planetId: string): QuizResult | null {
    try {
        const key = `${QUIZ_KEY_PREFIX}${planetId}`;
        const data = localStorage.getItem(key);
        if (!data) return null;

        const result = JSON.parse(data);
        result.completedAt = new Date(result.completedAt);
        return result;
    } catch (error) {
        console.error("Failed to load quiz result:", error);
        return null;
    }
}

/**
 * Check if user has completed quiz for a planet
 */
export function hasCompletedQuiz(planetId: string): boolean {
    return getQuizResult(planetId) !== null;
}

/**
 * Clear all data for a planet
 */
export function clearPlanetData(planetId: string): void {
    localStorage.removeItem(`${PROFILE_KEY_PREFIX}${planetId}`);
    localStorage.removeItem(`${QUIZ_KEY_PREFIX}${planetId}`);
}

/**
 * Clear all data
 */
export function clearAllData(): void {
    const keys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
            key &&
            (key.startsWith(PROFILE_KEY_PREFIX) || key.startsWith(QUIZ_KEY_PREFIX))
        ) {
            keys.push(key);
        }
    }

    keys.forEach((key) => localStorage.removeItem(key));
}

/**
 * Available badges that can be unlocked
 */
export const AVAILABLE_BADGES = {
    // Quiz-based (auto-unlocked)
    "🥉 Bronze Explorer": "Pass quiz with 1-2 correct answers",
    "🥈 Silver Expert": "Pass quiz with 3-4 correct answers",
    "🥇 Gold Master": "Perfect quiz score (5/5)",

    // Exploration-based
    "🗺️ Cartographer": "Visit all markers on the planet",
    "📸 Photographer": "View NASA images for all markers",
    "💬 Conversationalist": "Chat 10+ messages with AI",
    "🚀 Speed Runner": "Complete planet exploration in under 5 minutes",
    "🔍 Perfectionist": "Quiz 5/5 + all markers + 10 chats",

    // Role-specific
    "🔬 Mad Scientist": "Scientist role + Gold quiz",
    "🧭 Legendary Explorer": "Explorer role + Cartographer badge",
    "⚙️ Master Builder": "Engineer role + visit all structure markers",
    "✈️ Ace Pilot": "Pilot role + Speed Runner badge",
};

/**
 * Unlock a badge for a planet profile
 * Shows notification if badge is newly unlocked
 */
export function unlockBadge(
    planetId: string,
    badgeName: string
): boolean {
    const profile = getProfile(planetId);
    if (!profile) {
        console.warn(`No profile found for planet: ${planetId}`);
        return false;
    }

    // Check if badge already unlocked
    if (profile.badges.includes(badgeName)) {
        return false; // Already has this badge
    }

    // Add badge
    profile.badges.push(badgeName);
    saveProfile(profile);

    console.log(`🎉 Badge unlocked: ${badgeName}`);

    // Check for combo badges
    checkComboBadges(planetId);

    return true; // Newly unlocked
}

/**
 * Check and unlock combo badges based on profile state
 */
function checkComboBadges(planetId: string): void {
    const profile = getProfile(planetId);
    if (!profile) return;

    // 🔍 Perfectionist: Quiz 5/5 + Cartographer + Conversationalist
    if (
        profile.quizScore === 5 &&
        profile.badges.includes("🗺️ Cartographer") &&
        profile.badges.includes("💬 Conversationalist") &&
        !profile.badges.includes("🔍 Perfectionist")
    ) {
        unlockBadge(planetId, "🔍 Perfectionist");
    }

    // Role-specific badges
    if (profile.role === "scientist" && profile.quizTier === "gold") {
        unlockBadge(planetId, "🔬 Mad Scientist");
    }

    if (profile.role === "explorer" && profile.badges.includes("🗺️ Cartographer")) {
        unlockBadge(planetId, "🧭 Legendary Explorer");
    }

    if (profile.role === "pilot" && profile.badges.includes("🚀 Speed Runner")) {
        unlockBadge(planetId, "✈️ Ace Pilot");
    }
}

/**
 * Track exploration time for Speed Runner badge
 */
export function checkSpeedRunner(planetId: string): void {
    const profile = getProfile(planetId);
    if (!profile) return;

    const explorationTime = Date.now() - new Date(profile.createdAt).getTime();
    const fiveMinutes = 5 * 60 * 1000;

    if (explorationTime < fiveMinutes) {
        unlockBadge(planetId, "🚀 Speed Runner");
    }
}

/**
 * Mark minigame as completed for a planet
 */
export function setMinigameCompleted(planetId: string): void {
    try {
        const key = `${MINIGAME_COMPLETED_KEY}${planetId}`;
        localStorage.setItem(key, "true");
    } catch (error) {
        console.error("Failed to save minigame completion:", error);
    }
}

/**
 * Check if minigame has been completed for a planet
 */
export function hasCompletedMinigame(planetId: string): boolean {
    try {
        const key = `${MINIGAME_COMPLETED_KEY}${planetId}`;
        return localStorage.getItem(key) === "true";
    } catch (error) {
        console.error("Failed to check minigame completion:", error);
        return false;
    }
}
