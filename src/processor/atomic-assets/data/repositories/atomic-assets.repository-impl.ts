/*imports*/

import {
  Failure,
  log,
  MongoDB,
  parseToBigInt,
  RepositoryImpl,
  Result,
} from '@alien-worlds/api-core';
import { AtomicAsset } from '../../domain/entities/atomic-asset';
import { AtomicAssetsApiSource } from '../data-sources/atomic-assets.api.source';
import { AtomicAssetsMongoSource } from '../data-sources/atomic-assets.mongo.source';
import { AtomicAssetDocument } from '../dtos/atomic-assets.dto';
import { AtomicAssetMapper } from '../mappers';
import { AssetNotFoundError } from '../../domain/errors/asset-not-found.error';
import { AssetsNotFoundError } from '../../domain/errors/assets-not-found.error';

export class AtomicAssetRepositoryImpl extends RepositoryImpl<
  AtomicAsset,
  AtomicAssetDocument
> {
  constructor(
    private readonly api: AtomicAssetsApiSource,
    source: AtomicAssetsMongoSource,
    mapper: AtomicAssetMapper
  ) {
    super(source, mapper);
  }

  public async getAssets(
    assetIds: Array<string | number | bigint>
  ): Promise<Result<AtomicAsset[]>> {
    const assetsSearch = await this.find({
      filter: {
        asset_id: {
          $in: assetIds.map(id => MongoDB.Long.fromString(id.toString())),
        },
      },
    });

    const storedAssets = assetsSearch.isFailure ? [] : assetsSearch.content;

    if (assetIds.length === storedAssets.length) {
      return Result.withContent(storedAssets);
    }

    const assetsToFetch = assetIds.filter(
      id => storedAssets.findIndex(asset => asset.assetId === parseToBigInt(id)) === -1
    );

    const structs = await this.api.fetchMany(assetsToFetch);

    if (structs.length === 0) {
      return Result.withFailure(
        Failure.fromError(new AssetsNotFoundError(assetsToFetch))
      );
    }

    const newAssets = structs.map(AtomicAsset.create);

    const assetInsertion = await this.addMany(newAssets);

    if (assetInsertion.isFailure) {
      log(assetInsertion.failure.error);
    }

    return Result.withContent([...storedAssets, ...newAssets]);
  }

  public async getAsset(assetId: string | number | bigint): Promise<Result<AtomicAsset>> {
    const findAsset = await this.findOne({
      asset_id: MongoDB.Long.fromString(assetId.toString()),
    });

    if (findAsset.content) {
      return findAsset;
    }

    const struct = await this.api.fetchOne(assetId.toString());

    if (struct) {
      const asset = AtomicAsset.create(struct);
      await this.add(asset);

      return Result.withContent(asset);
    }

    return Result.withFailure(Failure.fromError(new AssetNotFoundError(assetId)));
  }
  /*methods*/
}
