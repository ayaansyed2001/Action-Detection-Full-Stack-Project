const API_BASE = 'http://localhost:8000/api';

export const APP_ORIGIN = 'http://localhost:8000';

export async function uploadVideoFile(file) {
  const formData = new FormData();
  formData.append('video_file', file);

  const response = await fetch(`${API_BASE}/videos/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload video');
  }

  return response.json();
}

export async function detectVideoActions(videoId) {
  const response = await fetch(`${API_BASE}/videos/${videoId}/detect_actions/`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to detect actions');
  }

  return response.json();
}

export async function fetchVideoDetections(videoId) {
  const response = await fetch(`${API_BASE}/videos/${videoId}/detections/`);

  if (!response.ok) {
    throw new Error('Failed to fetch detections');
  }

  return response.json();
}
