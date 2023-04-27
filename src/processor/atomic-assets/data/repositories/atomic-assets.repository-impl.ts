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
import { GetAtomicAssetsError } from '../../domain/errors/get-atomic-assets.error';

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
    assetIds: Array<string | number | bigint>,
    fetchMissingAssets: boolean
  ): Promise<Result<AtomicAsset[], GetAtomicAssetsError>> {
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

    if (fetchMissingAssets) {
      const response = await this.api.fetchMany(assetsToFetch);

      if (response.assets.error) {
        return Result.withFailure(
          Failure.fromError(
            new GetAtomicAssetsError(
              assetsToFetch.length,
              assetsToFetch.map(parseToBigInt),
              storedAssets,
              response.assets.error
            )
          )
        );
      }

      const newAssets = response.assets.content.map(AtomicAsset.create);

      const assetInsertion = await this.addMany(newAssets);

      if (assetInsertion.isFailure) {
        log(assetInsertion.failure.error.message);
      }

      return Result.withContent([...storedAssets, ...newAssets]);
    }

    return Result.withFailure(
      Failure.fromError(
        new GetAtomicAssetsError(
          assetIds.length,
          assetsToFetch.map(parseToBigInt),
          storedAssets,
          null
        )
      )
    );
  }

  /*methods*/
}
