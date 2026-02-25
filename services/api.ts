/**
 * api.ts — Frontend service using localStorage for persistence.
 * "Eliminates the API" by handling all data operations client-side.
 */

import { User, Issue, UserRole } from '../types';
import { MOCK_ISSUES } from '../constants';

// --- API CONFIGURATION ---
const API_BASE_URL = '/api';
const SESSION_KEY = 'currentUser';

// Helper for API calls
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
        console.log(`📡 Fetching: ${endpoint}`);
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error(`❌ API Error ${response.status} at ${endpoint}`);
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Error: ${response.status}`);
        }

        console.log(`✅ API Success: ${endpoint}`);
        return response.json();
    } catch (error: any) {
        clearTimeout(timeoutId);
        console.error(`❌ API Request Failed: ${error.message}`);
        if (error.name === 'AbortError') {
            throw new Error('La solicitud tardó demasiado. Comprueba tu conexión o el servidor.');
        }
        throw error;
    }
}

// ─── USER OPERATIONS ──────────────────────────────────────────────

/** Get user profile by ID */
export async function apiGetUser(id: string): Promise<User | null> {
    try {
        return await apiFetch<User>(`/users/${id}`);
    } catch (e) {
        return null;
    }
}

/** Get user profile by email */
export async function apiGetUserByEmail(email: string): Promise<User | null> {
    try {
        return await apiFetch<User>(`/users/by-email/${encodeURIComponent(email)}`);
    } catch (e) {
        return null;
    }
}

/** Create or update user profile */
export async function apiSaveUser(user: User): Promise<void> {
    await apiFetch(`/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(user),
    });

    // Update session if it's the current user
    const current = getStoredUser();
    if (current && current.id === user.id) {
        const updated = { ...current, ...user };
        localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    }
}

/** Login with email and password */
export async function apiLoginLocal(email: string, password: string): Promise<User> {
    const user = await apiFetch<User>('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
}

// Fallback: build a complete User object with defaults
/** Register a new user */
export async function apiRegisterLocal(email: string, password: string, name: string, surname: string, postalCode: string): Promise<User> {
    const result = await apiFetch<any>('/users/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, surname, postalCode }),
    });

    // Check if result is a user or error
    if (!result.id) throw new Error('Registration failed');

    const user = result as User;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
}

/** Logout */
export function apiLogoutLocal(): void {
    localStorage.removeItem(SESSION_KEY);
}

/** Get current session user */
export function getStoredUser(): User | null {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch (e) {
        return null;
    }
}

/** Change password for a user (requires current/old password) */
export async function apiChangePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    await apiFetch(`/users/${encodeURIComponent(userId)}/change-password`, {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword }),
    });
}

/** Send a forgot-password email */
export async function apiForgotPassword(email: string): Promise<void> {
    await apiFetch('/users/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
}

/** Reset password using a token from the email link */
export async function apiResetPassword(token: string, newPassword: string): Promise<void> {
    await apiFetch('/users/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
    });
}

// ─── REPORT OPERATIONS ──────────────────────────────────────────

/** Get all reports */
export async function apiGetReports(): Promise<Issue[]> {
    return await apiFetch<Issue[]>('/reports');
}

/** Save a new report (longer timeout for image uploads) */
export async function apiSaveReport(report: Issue): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s for large images
    try {
        const response = await fetch(`${API_BASE_URL}/reports`, {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report),
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Error: ${response.status}`);
        }
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('La subida tardó demasiado. Intenta con una imagen más pequeña.');
        }
        throw error;
    }
}

/** Update an existing report */
export async function apiUpdateReport(id: string, data: Partial<Issue>): Promise<void> {
    await apiFetch(`/reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

