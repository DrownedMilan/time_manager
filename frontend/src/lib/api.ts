const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export class ApiError extends Error {
  status: number
  info: unknown

  constructor(status: number, message: string, info?: unknown) {
    super(message)
    this.status = status
    this.info = info
  }
}

export async function api<TResponse>(
  path: string,
  options: {
    method?: HttpMethod
    body?: unknown
    headers?: Record<string, string>
    authToken?: string | null
  } = {},
): Promise<TResponse> {
  const { method = 'GET', body, headers = {}, authToken = null } = options

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  let data: unknown = null
  try {
    data = await res.json()
  } catch {
    console.log('error')
  }
  if (!res.ok) {
    throw new ApiError(res.status, `HTTP ${res.status}`, data)
  }

  return data as TResponse
}