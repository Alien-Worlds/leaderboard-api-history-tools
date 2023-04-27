import { Result } from '@alien-worlds/api-core';
import { AtomicAsset } from '../entities/atomic-asset';
import { GetAtomicAssetsError } from '../errors/get-atomic-assets.error';
/*imports*/

export abstract class AtomicAssetRepository {
  public static Token = 'ATOMIC_ASSET_REPOSITORY';

  public abstract getAssets(
    assetIds: Array<string | number | bigint>,
    fetchMissingAsset: boolean
  ): Promise<Result<AtomicAsset[], GetAtomicAssetsError>>;
  /*methods*/
}
