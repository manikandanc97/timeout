export function getApiErrorMessage(error: unknown, fallback: string): string {
  const payload = error as {
    response?: {
      data?: {
        message?: string;
        error?: string;
      };
    };
  };

  return payload.response?.data?.message ?? payload.response?.data?.error ?? fallback;
}
