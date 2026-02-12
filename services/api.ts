/**
 * api.ts — Frontend service to communicate with the Express/MongoDB backend
 * All Firestore operations are replaced by these REST calls.
 */

import { User, Issue } from '../types';

const API_BASE = '/api';

// ─── USER OPERATIONS ──────────────────────────────────────────────

/** Get user profile by ID */
export async function apiGetUser(id: string): Promise<User | null> {
    try {
        const res = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}`);
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('apiGetUser error:', err);
        return null;
    }
}

/** Get user profile by email */
export async function apiGetUserByEmail(email: string): Promise<User | null> {
    try {
        const res = await fetch(`${API_BASE}/users/by-email/${encodeURIComponent(email)}`);
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('apiGetUserByEmail error:', err);
        return null;
    }
}

/** Create or update user profile */
export async function apiSaveUser(user: User): Promise<void> {
    try {
        const userId = user.id || user.email || 'unknown';
        const res = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
        console.error('apiSaveUser error:', err);
        throw err;
    }
}

/** Login with email and password (local auth via MongoDB) */
export async function apiLoginLocal(email: string, password: string): Promise<User> {
    const res = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    const user = await res.json();
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
}

/** Register a new user with email and password */
export async function apiRegisterLocal(email: string, password: string, name?: string): Promise<User> {
    const res = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
    });

    if (res.status === 409) {
        throw new Error('Ya existe un usuario con ese email');
    }

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    const user = await res.json();
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
}

/** Logout and clear session */
export function apiLogoutLocal(): void {
    localStorage.removeItem('currentUser');
}

/** Get user from sessionStorage */
export function getStoredUser(): User | null {
    const stored = localStorage.getItem('currentUser');
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch (e) {
        return null;
    }
}

