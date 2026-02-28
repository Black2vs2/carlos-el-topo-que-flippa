const STORAGE_KEY = 'aoflip_auth_token';

export function initAuth() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (token) {
    localStorage.setItem(STORAGE_KEY, token);
    // Clean token from URL
    params.delete('token');
    const clean = params.toString();
    const newUrl = window.location.pathname + (clean ? `?${clean}` : '');
    window.history.replaceState({}, '', newUrl);
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}
