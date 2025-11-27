// Firebase Authentication Service
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    User,
    UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/config/firebase';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt: Date;
    lastLogin: Date;
}

/**
 * Register new user with email and password
 */
export async function registerWithEmail(
    email: string,
    password: string,
    displayName: string
): Promise<UserCredential> {
    try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update display name
        await updateProfile(user, { displayName });

        // Create user document in Firestore
        await createUserDocument(user, displayName);

        return userCredential;
    } catch (error: any) {
        console.error('Register error:', error);
        throw new Error(getAuthErrorMessage(error.code));
    }
}

/**
 * Login with email and password
 */
export async function loginWithEmail(
    email: string,
    password: string
): Promise<UserCredential> {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Update last login
        await updateLastLogin(userCredential.user.uid);

        return userCredential;
    } catch (error: any) {
        console.error('Login error:', error);
        throw new Error(getAuthErrorMessage(error.code));
    }
}

/**
 * Login with Google
 */
export async function loginWithGoogle(): Promise<UserCredential> {
    try {
        const userCredential = await signInWithPopup(auth, googleProvider);
        const user = userCredential.user;

        // Check if user document exists, if not create it
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            await createUserDocument(user, user.displayName || 'Anonymous');
        } else {
            // Update last login
            await updateLastLogin(user.uid);
        }

        return userCredential;
    } catch (error: any) {
        console.error('Google login error:', error);
        throw new Error(getAuthErrorMessage(error.code));
    }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Logout error:', error);
        throw new Error('Failed to logout');
    }
}

/**
 * Create user document in Firestore
 */
async function createUserDocument(user: User, displayName: string): Promise<void> {
    const userDoc: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: displayName,
        photoURL: user.photoURL || '',
        createdAt: new Date(),
        lastLogin: new Date(),
    };

    await setDoc(doc(db, 'users', user.uid), {
        ...userDoc,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
    });
}

/**
 * Update last login timestamp
 */
async function updateLastLogin(uid: string): Promise<void> {
    await setDoc(
        doc(db, 'users', uid),
        { lastLogin: serverTimestamp() },
        { merge: true }
    );
}

/**
 * Get user-friendly error messages
 */
function getAuthErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
        'auth/email-already-in-use': 'Email đã được sử dụng',
        'auth/invalid-email': 'Email không hợp lệ',
        'auth/operation-not-allowed': 'Thao tác không được phép',
        'auth/weak-password': 'Mật khẩu quá yếu (tối thiểu 6 ký tự)',
        'auth/user-disabled': 'Tài khoản đã bị vô hiệu hóa',
        'auth/user-not-found': 'Email không tồn tại',
        'auth/wrong-password': 'Mật khẩu không đúng',
        'auth/invalid-credential': 'Email hoặc mật khẩu không đúng',
        'auth/too-many-requests': 'Quá nhiều lần thử. Vui lòng thử lại sau',
        'auth/network-request-failed': 'Lỗi kết nối mạng',
        'auth/popup-closed-by-user': 'Đã hủy đăng nhập',
    };

    return errorMessages[errorCode] || 'Đã xảy ra lỗi. Vui lòng thử lại';
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
    return auth.currentUser;
}

/**
 * Check if user is logged in
 */
export function isAuthenticated(): boolean {
    return auth.currentUser !== null;
}
