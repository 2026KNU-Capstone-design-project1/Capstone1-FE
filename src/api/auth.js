const ACCESS_TOKEN_KEY = 'virnect.accessToken';
const TOKEN_TYPE_KEY = 'virnect.tokenType';
const USER_ROLE_KEY = 'virnect.userRole';

const WORKER_ROLES = new Set(['SITE_MANAGER', 'WORKER', 'OPERATOR']);

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = decodeURIComponent(
      atob(normalized)
        .split('')
        .map(character => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );

    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function normalizeRole(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeRole).find(Boolean) || '';
  }

  if (value && typeof value === 'object') {
    return normalizeRole(value.authority || value.role || value.name);
  }

  if (typeof value !== 'string') return '';

  const roles = value
    .split(/[ ,]+/)
    .map(role => role.trim().toUpperCase().replace(/^ROLE_/, ''));

  return roles.find(role => role === 'ADMIN' || WORKER_ROLES.has(role)) || '';
}

function resolveRole(auth) {
  const tokenPayload = decodeJwtPayload(auth?.accessToken || '');
  const candidates = [
    auth?.role,
    auth?.userRole,
    auth?.authority,
    auth?.authorities,
    auth?.user?.role,
    auth?.data?.role,
    tokenPayload?.role,
    tokenPayload?.userRole,
    tokenPayload?.authority,
    tokenPayload?.authorities,
    tokenPayload?.scope,
  ];

  return candidates.map(normalizeRole).find(Boolean) || 'ADMIN';
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = '요청 처리에 실패했습니다.';

    try {
      const error = await response.json();
      message = error.message || error.detail || message;
    } catch {
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type');
  return contentType?.includes('application/json')
    ? response.json()
    : null;
}

export function signup({ loginId, password, name, phone, email, role, siteName }) {
  return request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      loginId,
      password,
      name,
      hp: phone,
      email: email || null,
      role,
      siteName: siteName || null,
    }),
  });
}

export function checkLoginId(loginId) {
  return request('/api/auth/check-loginId', {
    method: 'POST',
    body: JSON.stringify({ loginId }),
  });
}

export async function login({ loginId, password }) {
  const auth = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ loginId, password }),
  });

  if (!auth?.accessToken) {
    throw new Error('로그인 응답에 accessToken이 없습니다.');
  }

  sessionStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken);
  sessionStorage.setItem(TOKEN_TYPE_KEY, auth.tokenType || 'Bearer');
  const role = resolveRole(auth);
  sessionStorage.setItem(USER_ROLE_KEY, role);

  return { ...auth, role };
}

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getUserRole() {
  return sessionStorage.getItem(USER_ROLE_KEY) || 'ADMIN';
}

export function isWorkerRole(role = getUserRole()) {
  return WORKER_ROLES.has(normalizeRole(role));
}

export function getRoleHomePath(role = getUserRole()) {
  return isWorkerRole(role) ? '/worker' : '/dashboard';
}

export function logout() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_TYPE_KEY);
  sessionStorage.removeItem(USER_ROLE_KEY);
}

export function authorizedRequest(path, options = {}) {
  const accessToken = getAccessToken();
  const tokenType = sessionStorage.getItem(TOKEN_TYPE_KEY) || 'Bearer';

  return request(path, {
    ...options,
    headers: {
      ...options.headers,
      ...(accessToken && {
        Authorization: `${tokenType} ${accessToken}`,
      }),
    },
  });
}
