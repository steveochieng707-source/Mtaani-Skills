export type UserRole = 'customer' | 'fundi' | 'admin';

export interface AuthUser {
  userId: number;
  name: string;
  role: UserRole;
}

export function getAuthUser(): AuthUser | null {
  try {
    const data = localStorage.getItem('mtaani_user');
    if (data) return JSON.parse(data);
  } catch (e) {}
  return null;
}

export function setAuthUser(user: AuthUser) {
  localStorage.setItem('mtaani_user', JSON.stringify(user));
  window.dispatchEvent(new Event('auth-change'));
}

export function logout() {
  localStorage.removeItem('mtaani_user');
  window.dispatchEvent(new Event('auth-change'));
}
