const ACCESS_TOKEN_KEY = 'virnect.accessToken';
const TOKEN_TYPE_KEY = 'virnect.tokenType';

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

export function signup({ loginId, password, name, phone, email }) {
  return request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      loginId,
      password,
      name,
      hp: phone,
      email: email || null,
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

  return auth;
}

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function logout() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_TYPE_KEY);
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
