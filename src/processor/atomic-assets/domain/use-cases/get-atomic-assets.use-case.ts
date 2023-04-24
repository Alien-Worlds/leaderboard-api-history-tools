import { AtomicAsset, AtomicAssetRepository } from '@alien-worlds/alienworlds-api-common';
import {
  Failure,
  inject,
  injectable,
  log,
  Result,
  UseCase,
} from '@alien-worlds/api-core';
import { AtomicAssetsPartialFetchError } from '../errors/atomic-assets-partial-fetch.error';
import { GetAtomicAssetsError } from '../errors/get-atomic-assets.error';
import { MinigToolData } from '../../../leaderboard/data/leaderboard.dtos';
/*imports*/

export const splitToChunks = <T = unknown>(items: T[], chunkSize: number) => {
  const chunks = [];
  items = [].concat(...items);

  while (items.length) {
    chunks.push(items.splice(0, chunkSize));
  }

  return chunks;
};

/**
 * @class
 */
@injectable()
export class GetAtomicAssetsUseCase implements UseCase<AtomicAsset[]> {
  public static Token = 'GET_ATOMIC_ASSETS_USE_CASE';

  constructor(
    @inject(AtomicAssetRepository.Token)
    private atomicAssetRepository: AtomicAssetRepository
  ) {}

  /**
   * @async
   */
  public async execute(
    ids: bigint[],
    chunkSize: number
  ): Promise<Result<AtomicAsset<MinigToolData>[], GetAtomicAssetsError>> {
    const assets = [];
    const chunks = splitToChunks(ids, chunkSize);
    const failed = [];

    for (const chunk of chunks) {
      const { content, failure: atomicAssetsFailure } =
        await this.atomicAssetRepository.getAssets(chunk);

      if (atomicAssetsFailure) {
        log(atomicAssetsFailure.error.message);
        failed.push(...chunk);
        continue;
      }

      if (assets.length < chunk.length) {
        log(new AtomicAssetsPartialFetchError(assets.length, chunk.length).message);
        failed.push(...chunk);
        continue;
      }

      assets.push(...content);
    }

    return failed.length === 0
      ? Result.withContent(assets)
      : Result.withFailure(
          Failure.fromError(new GetAtomicAssetsError(ids.length, failed, assets))
        );
  }
  /*methods*/
}
