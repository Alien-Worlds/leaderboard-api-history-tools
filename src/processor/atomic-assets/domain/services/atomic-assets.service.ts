import { Result } from '@alien-worlds/api-core';
import { AtomicAsset } from '../entities/atomic-asset';
import { GetAtomicAssetsError } from '../errors/get-atomic-assets.error';
/*imports*/

export abstract class AtomicAssetsService {
  public static Token = 'ATOMIC_ASSETS_SERVICE';

  public abstract getAssets(
    assetIds: Array<string | number | bigint>,
    fetchMissingAssets?: boolean,
  ): Promise<Result<AtomicAsset[], GetAtomicAssetsError>>;
  public abstract isAvailable(): boolean;
  /*methods*/
}
