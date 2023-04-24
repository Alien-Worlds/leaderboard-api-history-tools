import { AtomicAsset } from '@alien-worlds/alienworlds-api-common';
import { MinigToolData } from '../../../leaderboard/data/leaderboard.dtos';

export class GetAtomicAssetsError extends Error {
  constructor(
    public readonly total: number,
    public readonly failedFetch: bigint[],
    public readonly assets: AtomicAsset<MinigToolData>[]
  ) {
    super(
      assets.length > 0
        ? `Partially fetched assets ${assets.length}/${total}`
        : `Fetching ${total} atomic assets failed.`
    );
  }
}
