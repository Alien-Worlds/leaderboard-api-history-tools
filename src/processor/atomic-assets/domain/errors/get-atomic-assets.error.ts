export class GetAtomicAssetsError extends Error {
  constructor(total: number, failedFetchCount: number, parialFetchCount: number) {
    super(
      `Fetching ${total} atomic assets failed: failed fetch: ${failedFetchCount} | partial fetch: ${parialFetchCount}`
    );
  }
}
