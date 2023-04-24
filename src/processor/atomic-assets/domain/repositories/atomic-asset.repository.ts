import { Result } from '@alien-worlds/api-core';
import { AtomicAsset } from '../entities/atomic-asset';
/*imports*/

export abstract class AtomicAssetRepository {
  public static Token = 'ATOMIC_ASSET_REPOSITORY';

  public abstract getAssets(
    assetIds: Array<string | number | bigint>
  ): Promise<Result<AtomicAsset[]>>;

  public abstract hasAssets(
    assetIds: Array<string | number | bigint>
  ): Promise<Result<boolean>>;
  /*methods*/
}
