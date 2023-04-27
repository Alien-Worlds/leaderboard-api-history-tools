import { AtomicAsset } from '@alien-worlds/alienworlds-api-common';

export class GetAtomicAssetsError extends Error {
  constructor(
    public readonly total: number,
    public readonly failedFetch: bigint[],
    public readonly assets: AtomicAsset[],
    public readonly apiError?: Error,
  ) {
    super(
      assets.length > 0
        ? `Partially fetched assets ${assets.length}/${total}`
        : `Fetching ${total} atomic assets failed.`
    );
  }
}
