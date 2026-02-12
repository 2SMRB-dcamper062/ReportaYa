/**
 * api.ts — Frontend service using localStorage for persistence.
 * "Eliminates the API" by handling all data operations client-side.
 */

import { User, Issue, UserRole } from '../types';
import { MOCK_ISSUES } from '../constants';

const USERS_KEY = 'reportaya_users';
const REPORTS_KEY = 'reportaya_reports';
const SESSION_KEY = 'currentUser';

// Helper to get items from localStorage
function getLocal<T>(key: string, defaultValue: T): T {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    try {
        return JSON.parse(stored);
    } catch (e) {
        return defaultValue;
    }
}

// Helper to save items to localStorage
function setLocal<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
}

// ─── USER OPERATIONS ──────────────────────────────────────────────

/** Get user profile by ID */
export async function apiGetUser(id: string): Promise<User | null> {
    const users = getLocal<User[]>(USERS_KEY, []);
    return users.find(u => u.id === id) || null;
}

/** Get user profile by email */
export async function apiGetUserByEmail(email: string): Promise<User | null> {
    const users = getLocal<User[]>(USERS_KEY, []);
    return users.find(u => u.email === email) || null;
}

/** Create or update user profile */
export async function apiSaveUser(user: User): Promise<void> {
    const users = getLocal<User[]>(USERS_KEY, []);
    const index = users.findIndex(u => u.id === user.id);
    if (index > -1) {
        users[index] = { ...users[index], ...user };
    } else {
        users.push(user);
    }
    setLocal(USERS_KEY, users);

    // Update session if it's the current user
    const current = getStoredUser();
    if (current && current.id === user.id) {
        setLocal(SESSION_KEY, { ...current, ...user });
    }
}

/** Login with email and password */
export async function apiLoginLocal(email: string, password: string): Promise<User> {
    const users = getLocal<User[]>(USERS_KEY, []);
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        throw new Error('Credenciales inválidas');
    }

    const { password: _, ...safeUser } = user;
    setLocal(SESSION_KEY, safeUser);
    return safeUser as User;
}

/** Register a new user */
export async function apiRegisterLocal(email: string, password: string, name?: string): Promise<User> {
    const users = getLocal<User[]>(USERS_KEY, []);
    if (users.some(u => u.email === email)) {
        throw new Error('Ya existe un usuario con ese email');
    }

    const newUser: User = {
        id: `local-${Date.now()}`,
        email,
        password,
        name: name || email.split('@')[0],
        role: UserRole.CITIZEN,
        points: 0,
        experience: 0,
        inventory: [],
        premium: false
    };

    users.push(newUser);
    setLocal(USERS_KEY, users);

    const { password: _, ...safeUser } = newUser;
    setLocal(SESSION_KEY, safeUser);
    return safeUser as User;
}

/** Logout */
export function apiLogoutLocal(): void {
    localStorage.removeItem(SESSION_KEY);
}

/** Get current session user */
export function getStoredUser(): User | null {
    return getLocal<User | null>(SESSION_KEY, null);
}

// ─── REPORT OPERATIONS ──────────────────────────────────────────

/** Get all reports */
export async function apiGetReports(): Promise<Issue[]> {
    const reports = getLocal<Issue[]>(REPORTS_KEY, MOCK_ISSUES);
    return reports;
}

/** Save a new report */
export async function apiSaveReport(report: Issue): Promise<void> {
    const reports = getLocal<Issue[]>(REPORTS_KEY, MOCK_ISSUES);
    reports.unshift(report); // Add to beginning
    setLocal(REPORTS_KEY, reports);
}

/** Update an existing report */
export async function apiUpdateReport(report: Issue): Promise<void> {
    const reports = getLocal<Issue[]>(REPORTS_KEY, MOCK_ISSUES);
    const index = reports.findIndex(r => r.id === report.id);
    if (index > -1) {
        reports[index] = { ...reports[index], ...report };
        setLocal(REPORTS_KEY, reports);
    }
}
