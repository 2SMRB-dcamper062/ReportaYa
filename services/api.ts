/**
 * api.ts — Frontend service using localStorage for persistence.
 * "Eliminates the API" by handling all data operations client-side.
 */

import { User, Issue, UserRole } from '../types';
import { MOCK_ISSUES } from '../constants';

// --- API CONFIGURATION ---
const API_BASE_URL = 'http://localhost:3001/api';
const SESSION_KEY = 'currentUser';

// Helper for API calls
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${response.status}`);
    }

    return response.json();
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

/** Register a new user */
export async function apiRegisterLocal(email: string, password: string, name?: string): Promise<User> {
    const user = await apiFetch<User>('/users/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
    });

    // Automatically login after register (if the backend returns the user profile)
    // The backend register currently returns { id, name, email }, but we might need 
    // a full login to get the complete profile or just treat this as the session.
    // For now, let's just store what we have or fetch the full profile.
    const fullUser = await apiGetUser(user.id);
    if (fullUser) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(fullUser));
        return fullUser;
    }

    return user as User;
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

// ─── REPORT OPERATIONS ──────────────────────────────────────────

/** Get all reports */
export async function apiGetReports(): Promise<Issue[]> {
    return await apiFetch<Issue[]>('/reports');
}

/** Save a new report */
export async function apiSaveReport(report: Issue): Promise<void> {
    await apiFetch('/reports', {
        method: 'POST',
        body: JSON.stringify(report),
    });
}

/** Update an existing report */
export async function apiUpdateReport(id: string, data: Partial<Issue>): Promise<void> {
    await apiFetch(`/reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

