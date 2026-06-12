/**
 * apiRemote.ts — Remote API service for mobile app
 * Connects to AWS server at 52.70.109.228:3001
 */

import { User, Issue } from '../types';

const API_BASE = 'http://52.70.109.228:3000';

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || 'Error en la petición');
  }
  
  return response.json();
}

export async function apiGetUser(id: string): Promise<User | null> {
  try {
    return await apiRequest<User>(`/api/users/${id}`);
  } catch {
    return null;
  }
}

export async function apiGetUserByEmail(email: string): Promise<User | null> {
  try {
    return await apiRequest<User>(`/api/users/by-email/${encodeURIComponent(email)}`);
  } catch {
    return null;
  }
}

export async function apiSaveUser(user: User): Promise<void> {
  await apiRequest(`/api/users/${user.id}`, {
    method: 'PUT',
    body: JSON.stringify(user),
  });
}

export async function apiLoginLocal(email: string, password: string): Promise<User> {
  return apiRequest<User>('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegisterLocal(
  email: string,
  password: string,
  name: string,
  surname: string,
  postalCode: string
): Promise<User> {
  return apiRequest<User>('/api/users/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, surname, postalCode }),
  });
}

export async function apiGetReports(): Promise<Issue[]> {
  return apiRequest<Issue[]>('/api/reports');
}

export async function apiSaveReport(report: Issue): Promise<void> {
  await apiRequest('/api/reports', {
    method: 'POST',
    body: JSON.stringify(report),
  });
}

export async function apiUpdateReport(id: string, data: Partial<Issue>): Promise<void> {
  await apiRequest(`/api/reports/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiChangePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
  await apiRequest(`/api/users/${userId}/change-password`, {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

export async function apiForgotPassword(email: string): Promise<void> {
  await apiRequest('/api/users/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function apiResetPassword(token: string, newPassword: string): Promise<void> {
  await apiRequest('/api/users/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

const SESSION_KEY = 'currentUser';

export function getStoredUser(): User | null {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function apiLogoutLocal(): void {
  localStorage.removeItem(SESSION_KEY);
}