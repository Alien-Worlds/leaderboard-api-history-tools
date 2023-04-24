import { AtomicAssetDocument } from './../dtos/atomic-assets.dto';
import { CollectionMongoSource, MongoSource } from '@alien-worlds/api-core';

/*imports*/

/**
 * @class
 */
export class AtomicAssetsMongoSource extends CollectionMongoSource<AtomicAssetDocument> {
  /**
   * @constructor
   * @param {MongoSource} mongoSource
   */
  constructor(mongoSource: MongoSource) {
    super(mongoSource, 'atomic_assets', {
      indexes: [
        { key: { contract: 1 }, background: true },
        { key: { asset_id: 1 }, background: true },
        { key: { owner: 1 }, background: true },
        { key: { name: 1 }, background: true },
        {
          key: {
            contract: 1,
            asset_id: 1,
            owner: 1,
          },
          unique: true,
          background: true,
        },
      ],
    });
  }
}
