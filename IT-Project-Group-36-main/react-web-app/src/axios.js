import axios from "axios";

REACT_APP_API_BASE_URL = "http://localhost:5000"

const api = axios.create({
  baseURL: REACT_APP_API_BASE_URL, // base API URL
});

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

export default api;