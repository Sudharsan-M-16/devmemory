const API_BASE = "http://localhost:8000"; // FastAPI base URL

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function queryError(errorText) {
  const res = await fetch(`${API_BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error_text: errorText }),
  });
  return handleResponse(res);
}

export async function learnError(errorText, fix) {
  const res = await fetch(`${API_BASE}/learn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error_text: errorText, fix }),
  });
  return handleResponse(res);
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  return handleResponse(res);
}

export async function fetchMemory(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${API_BASE}/memory?${query}` : `${API_BASE}/memory`;
  const res = await fetch(url);
  return handleResponse(res);
}

