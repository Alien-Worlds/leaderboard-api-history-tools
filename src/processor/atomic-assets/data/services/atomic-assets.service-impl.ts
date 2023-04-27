import { AtomicAsset, AtomicAssetsApiConfig } from '@alien-worlds/alienworlds-api-common';
import { Failure, log, Result } from '@alien-worlds/api-core';
import { arrayDiff, splitToChunks } from '../../atomic-assets.utils';
import { AtomicAssetsService } from '../../domain/services/atomic-assets.service';
import { AtomicAssetsPartialFetchError } from '../../domain/errors/atomic-assets-partial-fetch.error';
import { GetAtomicAssetsError } from '../../domain/errors/get-atomic-assets.error';
import { AtomicAssetRepository } from '../../domain/repositories/atomic-asset.repository';
/*imports*/

/**
 * @class
 */
export class AtomicAssetsServiceImpl implements AtomicAssetsService {
  constructor(
    private atomicAssetRepository: AtomicAssetRepository,
    private config: AtomicAssetsApiConfig
  ) {}

  private lastFailedFetchTimestamp: Date;

  public isAvailable(): boolean {
    if (this.lastFailedFetchTimestamp) {
      return Date.now() - this.lastFailedFetchTimestamp.getTime() > 60000;
    }

    return true;
  }

  public async getAssets(
    ids: (string | number | bigint)[],
    fetchMissingAssets = true
  ): Promise<Result<AtomicAsset<object>[], GetAtomicAssetsError>> {
    const assets = [];
    const failed = [];
    const chunks = splitToChunks(
      ids,
      fetchMissingAssets ? this.config.maxAssetsPerRequest : 100
    );

    while (chunks.length > 0) {
      const chunk = chunks.shift();

      const { content, failure: atomicAssetsFailure } =
        await this.atomicAssetRepository.getAssets(chunk, fetchMissingAssets);

      if (atomicAssetsFailure) {
        failed.push(...chunk);
        if (atomicAssetsFailure.error.apiError) {
          log(`Atomic Assets API error:`, atomicAssetsFailure.error.apiError.message);
          this.lastFailedFetchTimestamp = new Date();
          failed.push(
            ...chunks.reduce((list, chunk) => {
              list.push(...chunk);
              return list;
            }, [])
          );
          break;
        } else {
          log(atomicAssetsFailure.error.message);
          continue;
        }
      }

      if (content.length < chunk.length) {
        log(new AtomicAssetsPartialFetchError(content.length, chunk.length).message);
        failed.push(...arrayDiff(chunk, content));
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
