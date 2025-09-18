const API_URL = import.meta.env.VITE_API_URL;

// Example for /chat POST request
async function sendMessage(message, sessionId) {
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id: sessionId })
  });

  const data = await response.json();
  return data;
}

// Example for /upload POST request
async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  return data;
}
