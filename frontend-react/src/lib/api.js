export function getToken() {
  return localStorage.getItem('denthiveToken')
}

export function logout() {
  localStorage.removeItem('denthiveToken')
}

export function apiFetch(path, { method = 'GET', body } = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
  }

  // Backend expects JWT in `Authorization: Bearer <token>`.
  if (token) headers.Authorization = `Bearer ${token}`

  return fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
}




