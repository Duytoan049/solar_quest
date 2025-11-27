// Firestore Database Service for Planet Profiles
import {
    collection,
    doc,
    getDoc,
    setDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { PlanetProfile } from '@/types/profile';

// Firestore collection names
const COLLECTIONS = {
    USERS: 'users',
    PROFILES: 'profiles',
    LEADERBOARD: 'leaderboard',
};

/**
 * Get user's planet profile from Firestore
 */
export async function getFirestoreProfile(
    userId: string,
    planetId: string
): Promise<PlanetProfile | null> {
    try {
        const profileId = `${userId}_${planetId}`;
        const profileDoc = await getDoc(doc(db, COLLECTIONS.PROFILES, profileId));

        if (!profileDoc.exists()) {
            return null;
        }

        const data = profileDoc.data();
        return {
            ...data,
            lastVisited: data.lastVisited?.toDate?.() || new Date(),
        } as PlanetProfile;
    } catch (error) {
        console.error('Error getting profile:', error);
        return null;
    }
}

/**
 * Save planet profile to Firestore
 */
export async function saveFirestoreProfile(
    userId: string,
    planetId: string,
    profile: PlanetProfile
): Promise<void> {
    try {
        const profileId = `${userId}_${planetId}`;
        const profileData = {
            ...profile,
            userId,
            planetId,
            lastVisited: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(doc(db, COLLECTIONS.PROFILES, profileId), profileData, { merge: true });

        // Also update leaderboard
        await updateLeaderboard(userId);
    } catch (error) {
        console.error('Error saving profile:', error);
        throw new Error('Failed to save profile');
    }
}/**
 * Get all planet profiles for a user
 */
export async function getAllUserProfiles(userId: string): Promise<PlanetProfile[]> {
    try {
        const q = query(
            collection(db, COLLECTIONS.PROFILES),
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        const profiles: PlanetProfile[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            profiles.push({
                ...data,
                lastVisited: data.lastVisited?.toDate?.() || new Date(),
            } as PlanetProfile);
        });

        return profiles;
    } catch (error) {
        console.error('Error getting all profiles:', error);
        return [];
    }
}

/**
 * Update last visited timestamp
 */
export async function updateFirestoreLastVisited(
    userId: string,
    planetId: string
): Promise<void> {
    try {
        const profileId = `${userId}_${planetId}`;
        await setDoc(
            doc(db, COLLECTIONS.PROFILES, profileId),
            { lastVisited: serverTimestamp() },
            { merge: true }
        );
    } catch (error) {
        console.error('Error updating last visited:', error);
    }
}

/**
 * Unlock badge in Firestore
 */
export async function unlockFirestoreBadge(
    userId: string,
    planetId: string,
    badge: string
): Promise<void> {
    try {
        const profile = await getFirestoreProfile(userId, planetId);
        if (!profile) return;

        if (!profile.badges.includes(badge)) {
            const updatedBadges = [...profile.badges, badge];
            const profileId = `${userId}_${planetId}`;

            await setDoc(
                doc(db, COLLECTIONS.PROFILES, profileId),
                { badges: updatedBadges, updatedAt: serverTimestamp() },
                { merge: true }
            );
        }
    } catch (error) {
        console.error('Error unlocking badge:', error);
    }
}

/**
 * Update quiz score in Firestore
 */
export async function updateFirestoreQuizScore(
    userId: string,
    planetId: string,
    score: number,
    tier: 'bronze' | 'silver' | 'gold'
): Promise<void> {
    try {
        const profileId = `${userId}_${planetId}`;
        await setDoc(
            doc(db, COLLECTIONS.PROFILES, profileId),
            {
                quizScore: score,
                quizTier: tier,
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );

        // Update leaderboard
        await updateLeaderboard(userId);
    } catch (error) {
        console.error('Error updating quiz score:', error);
    }
}

/**
 * Leaderboard entry interface
 */
export interface LeaderboardEntry {
    userId: string;
    displayName: string;
    photoURL?: string;
    totalScore: number;
    totalBadges: number;
    planetsCompleted: number;
    lastUpdated: Date;
    rank?: number;
}

/**
 * Update user's leaderboard entry
 */
async function updateLeaderboard(userId: string): Promise<void> {
    try {
        // Get all user profiles
        const profiles = await getAllUserProfiles(userId);

        // Calculate totals
        const totalScore = profiles.reduce((sum, p) => sum + p.quizScore, 0);
        const totalBadges = profiles.reduce((sum, p) => sum + p.badges.length, 0);
        const planetsCompleted = profiles.filter(p => p.quizScore >= 3).length;

        // Get user info
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
        const userData = userDoc.data();

        // Update leaderboard entry
        await setDoc(doc(db, COLLECTIONS.LEADERBOARD, userId), {
            userId,
            displayName: userData?.displayName || 'Anonymous',
            photoURL: userData?.photoURL || '',
            totalScore,
            totalBadges,
            planetsCompleted,
            lastUpdated: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating leaderboard:', error);
    }
}

/**
 * Get global leaderboard
 */
export async function getLeaderboard(limitCount: number = 100): Promise<LeaderboardEntry[]> {
    try {
        const q = query(
            collection(db, COLLECTIONS.LEADERBOARD),
            orderBy('totalScore', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const leaderboard: LeaderboardEntry[] = [];

        querySnapshot.forEach((doc, index) => {
            const data = doc.data();
            leaderboard.push({
                ...data,
                lastUpdated: data.lastUpdated?.toDate?.() || new Date(),
                rank: index + 1,
            } as LeaderboardEntry);
        });

        return leaderboard;
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        return [];
    }
}

/**
 * Get user's leaderboard rank
 */
export async function getUserRank(userId: string): Promise<number | null> {
    try {
        const leaderboard = await getLeaderboard(1000);
        const userIndex = leaderboard.findIndex(entry => entry.userId === userId);
        return userIndex >= 0 ? userIndex + 1 : null;
    } catch (error) {
        console.error('Error getting user rank:', error);
        return null;
    }
}

/**
 * Migrate localStorage profile to Firestore
 */
export async function migrateLocalStorageToFirestore(
    userId: string,
    planetId: string,
    localProfile: PlanetProfile
): Promise<void> {
    try {
        // Check if Firestore profile exists
        const firestoreProfile = await getFirestoreProfile(userId, planetId);

        if (!firestoreProfile) {
            // No Firestore profile, save local data
            await saveFirestoreProfile(userId, planetId, localProfile);
            console.log(`✅ Migrated ${planetId} profile to Firestore`);
        } else {
            // Merge: Keep better score
            const mergedProfile: PlanetProfile = {
                ...firestoreProfile,
                quizScore: Math.max(localProfile.quizScore, firestoreProfile.quizScore),
                quizTier: localProfile.quizScore > firestoreProfile.quizScore
                    ? localProfile.quizTier
                    : firestoreProfile.quizTier,
                badges: [...new Set([...localProfile.badges, ...firestoreProfile.badges])],
            };

            await saveFirestoreProfile(userId, planetId, mergedProfile);
            console.log(`✅ Merged ${planetId} profile (local + cloud)`);
        }
    } catch (error) {
        console.error('Error migrating profile:', error);
    }
}
