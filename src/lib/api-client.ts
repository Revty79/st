// src/lib/api-client.ts
/**
 * Shared API client utility for builder pages
 */

export async function apiClient<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.ok === false) {
    throw new Error(data?.error || `HTTP ${response.status}`);
  }

  return data as T;
}

/**
 * Helper to handle API errors consistently
 */
export function handleApiError(error: any, context: string = "Operation") {
  console.error(`${context} failed:`, error);
  const message = error?.message || String(error);
  alert(`${context} failed: ${message}`);
}
