export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return fallback;
  }
  const data = (error as { response?: { data?: unknown } }).response?.data;
  if (data && typeof data === 'object' && 'message' in data) {
    const msg = (data as { message: unknown }).message;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  return fallback;
}
