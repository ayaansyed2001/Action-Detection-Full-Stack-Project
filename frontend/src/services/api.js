const API_BASE = 'http://localhost:8000/api';

export const APP_ORIGIN = 'http://localhost:8000';
export const AUTH_TOKEN_KEY = 'action-detection-token';

function formatApiErrorMessage(data) {
  if (!data || typeof data !== 'object') {
    return 'Request failed';
  }

  if (typeof data.detail === 'string') {
    return data.detail;
  }

  if (typeof data.error === 'string') {
    return data.error;
  }

  const fieldMessages = Object.entries(data)
    .filter(([key]) => key !== 'detail' && key !== 'error')
    .flatMap(([field, value]) => {
      if (Array.isArray(value)) {
        return value.map((message) => `${field}: ${message}`);
      }

      if (typeof value === 'string') {
        return [`${field}: ${value}`];
      }

      return [];
    });

  return fieldMessages[0] || 'Request failed';
}

function getAuthToken() {
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function storeAuthToken(token) {
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

async function apiRequest(path, options = {}) {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Token ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = formatApiErrorMessage(data);
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function signUpUser(payload) {
  return apiRequest('/auth/signup/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload) {
  const data = await apiRequest('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  storeAuthToken(data.token);
  return data;
}

export async function logoutUser() {
  try {
    await apiRequest('/auth/logout/', { method: 'POST', body: JSON.stringify({}) });
  } finally {
    storeAuthToken(null);
  }
}

export function hasStoredAuthToken() {
  return Boolean(getAuthToken());
}

export async function fetchCurrentUser() {
  return apiRequest('/auth/me/');
}

export async function fetchVideos() {
  return apiRequest('/videos/');
}

export async function uploadVideoFile(file) {
  const formData = new FormData();
  formData.append('video_file', file);

  return apiRequest('/videos/', {
    method: 'POST',
    body: formData,
  });
}

export async function detectVideoActions(videoId) {
  return apiRequest(`/videos/${videoId}/detect_actions/`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function fetchVideoDetections(videoId) {
  return apiRequest(`/videos/${videoId}/detections/`);
}
