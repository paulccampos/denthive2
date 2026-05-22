export function getToken() {
  return localStorage.getItem('denthiveToken')
}

export function apiFetch(path, { method = 'GET', body } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  }

  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  return fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
}

