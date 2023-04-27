import {
  removeUndefinedProperties,
  MongoDB,
  parseToBigInt,
} from '@alien-worlds/api-core';
import { LeaderboardUpdateDocument } from '../../../leaderboard/data/leaderboard.dtos';
import { AtomicAssetsDownloadDocument } from '../../data/dtos/atomic-assets.dto';

/**
 * @class
 */
export class AtomicAssetsDownload {
  public static fromDocument(
    document: AtomicAssetsDownloadDocument
  ): AtomicAssetsDownload {
    const { _id, asset_id, leaderboard_update_id } = document;

    return new AtomicAssetsDownload(
      parseToBigInt(asset_id),
      leaderboard_update_id,
      _id instanceof MongoDB.ObjectId ? _id.toString() : null
    );
  }

  public static create(
    assetId: string | number | bigint,
    leaderboardUpdateId: string
  ): AtomicAssetsDownload {
    return new AtomicAssetsDownload(parseToBigInt(assetId), leaderboardUpdateId);
  }

  /**
   * @constructor
   */
  protected constructor(
    public readonly assetId: bigint,
    public readonly leaderboardUpdateId?: string,
    public readonly id?: string
  ) {}

  /**
   *
   * @returns {AtomicAssetsDownloadDocument}
   */
  public toDocument(): AtomicAssetsDownloadDocument {
    const { id, assetId, leaderboardUpdateId: leaderboard_update_id } = this;

    const document: AtomicAssetsDownloadDocument = {
      asset_id: MongoDB.Long.fromBigInt(assetId),
      leaderboard_update_id,
    };

    if (id && MongoDB.ObjectId.isValid(id)) {
      document._id = new MongoDB.ObjectId(id);
    }

    return removeUndefinedProperties<LeaderboardUpdateDocument>(document);
  }
}
