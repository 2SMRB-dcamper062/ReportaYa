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
export async function apiLoginLocal(email: string, password: string): Promise<User | null> {
    try {
        const res = await fetch(`${API_BASE}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (res.status === 401) return null;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('apiLoginLocal error:', err);
        return null;
    }
}

// ─── REPORT OPERATIONS ───────────────────────────────────────────

/** Get all reports */
export async function apiGetReports(): Promise<Issue[]> {
    try {
        const res = await fetch(`${API_BASE}/reports`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('apiGetReports error:', err);
        return [];
    }
}

/** Create a new report */
export async function apiSaveReport(report: Issue): Promise<void> {
    try {
        const res = await fetch(`${API_BASE}/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
        console.error('apiSaveReport error:', err);
        throw err;
    }
}

/** Update an existing report */
export async function apiUpdateReport(id: string, data: Partial<Issue>): Promise<void> {
    try {
        const res = await fetch(`${API_BASE}/reports/${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
        console.error('apiUpdateReport error:', err);
        throw err;
    }
}

/** Delete a report */
export async function apiDeleteReport(id: string): Promise<void> {
    try {
        const res = await fetch(`${API_BASE}/reports/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
        console.error('apiDeleteReport error:', err);
        throw err;
    }
}

/** Get a single report by ID */
export async function apiGetReport(id: string): Promise<Issue | null> {
    try {
        const res = await fetch(`${API_BASE}/reports/${encodeURIComponent(id)}`);
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('apiGetReport error:', err);
        return null;
    }
}

/** Register a new user with email and password */
export async function apiRegisterUser(email: string, password: string, name?: string): Promise<User | null> {
    try {
        const res = await fetch(`${API_BASE}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        });
        if (res.status === 409) {
            throw new Error('Ya existe un usuario con ese email');
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('apiRegisterUser error:', err);
        throw err;
    }
}
