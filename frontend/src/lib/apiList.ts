export type ApiListEnvelope<T> = {
  data?: T[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
};

export function extractApiList<T>(payload: T[] | ApiListEnvelope<T> | null | undefined): T[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}
