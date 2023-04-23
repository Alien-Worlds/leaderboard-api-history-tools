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
  public async execute(ids: bigint[]): Promise<Result<AtomicAsset[]>> {
    const assets = [];
    const chunks = splitToChunks(ids, 10);
    let fetchFailureCount = 0;
    let partialFetchCount = 0;

    for (const chunk of chunks) {
      const { content, failure: atomicAssetsFailure } =
        await this.atomicAssetRepository.getAssets(chunk);

      if (atomicAssetsFailure) {
        log(atomicAssetsFailure.error.message);
        fetchFailureCount++;
        continue;
      }

      if (assets.length < chunk.length) {
        log(new AtomicAssetsPartialFetchError(assets.length, chunk.length).message);
        partialFetchCount++;
        continue;
      }

      assets.push(...content);
    }

    return fetchFailureCount + partialFetchCount < ids.length
      ? Result.withContent(assets)
      : Result.withFailure(
          Failure.fromError(
            new GetAtomicAssetsError(ids.length, fetchFailureCount, partialFetchCount)
          )
        );
  }
  /*methods*/
}
