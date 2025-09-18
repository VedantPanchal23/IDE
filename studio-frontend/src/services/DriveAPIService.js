const API_BASE_URL = 'http://localhost:3001/api/drive';

const getAuthHeaders = () => {
  const token = localStorage.getItem('google_access_token');
  if (!token) {
    // Handle the case where the user is not authenticated
    // This might involve redirecting to login or showing an error
    throw new Error('No access token found. Please log in again.');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  // Check if content-type is application/json before parsing
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  } else {
    // Handle non-JSON responses, like raw file content
    return response.text();
  }
};

export const initDrive = async () => {
  const response = await fetch(`${API_BASE_URL}/init`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const executeTerminalCommand = async (command) => {
  const response = await fetch(`${API_BASE_URL}/../terminal/execute`, { // Note the relative path to get to /api/terminal
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ command }),
  });
  return handleResponse(response);
};

export const listFiles = async (path = '/') => {
  const response = await fetch(`${API_BASE_URL}/list?path=${encodeURIComponent(path)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse(response);
  return data.files;
};

export const readFile = async (path) => {
  const response = await fetch(`${API_BASE_URL}/file?path=${encodeURIComponent(path)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  // readFile returns raw text, so we handle it directly
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.text();
};

export const saveFile = async (path, content) => {
  const response = await fetch(`${API_BASE_URL}/file`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ path, content }),
  });
  return handleResponse(response);
};

export const createFolder = async (path) => {
  const response = await fetch(`${API_BASE_URL}/folder`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ path }),
  });
  return handleResponse(response);
};
