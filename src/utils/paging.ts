export type Paging = { limit: number; offset: number };

export function parsePaging(input: { limit?: string; offset?: string }): Paging {
  const limitRaw = Number(input.limit ?? "10");
  const offsetRaw = Number(input.offset ?? "0");

  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(100, Math.trunc(limitRaw))) : 10;
  const offset = Number.isFinite(offsetRaw) ? Math.max(0, Math.trunc(offsetRaw)) : 0;

  return { limit, offset };
}