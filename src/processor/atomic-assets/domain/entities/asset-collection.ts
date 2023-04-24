import {
  removeUndefinedProperties,
  MongoDB,
  parseToBigInt,
} from '@alien-worlds/api-core';
import {
  AssetCollectionDocument,
  AssetCollectionStruct,
} from '../../data/dtos/atomic-assets.dto';

/*imports*/
/**
 *
 * @class
 */
export class AssetCollection {
  public static fromStruct(dto: AssetCollectionStruct): AssetCollection {
    const {
      collection_name,
      name,
      author,
      allow_notify,
      authorized_accounts,
      notify_accounts,
      market_fee,
      created_at_block,
      created_at_time,
      ...rest
    } = dto;
    return new AssetCollection(
      collection_name,
      name,
      author,
      allow_notify,
      authorized_accounts,
      notify_accounts,
      market_fee,
      created_at_block ? parseToBigInt(created_at_block) : null,
      created_at_time ? new Date(Number(created_at_time)) : null,
      rest
    );
  }

  public static fromDocument(dto: AssetCollectionDocument): AssetCollection {
    const {
      collection_name,
      name,
      author,
      allow_notify,
      authorized_accounts,
      notify_accounts,
      market_fee,
      created_at_block,
      created_at_time,
      ...rest
    } = dto;
    return new AssetCollection(
      collection_name,
      name,
      author,
      allow_notify,
      authorized_accounts,
      notify_accounts,
      market_fee,
      created_at_block ? parseToBigInt(created_at_block) : null,
      created_at_time ? new Date(Number(created_at_time)) : null,
      rest
    );
  }

  /**
   * @private
   * @constructor
   */
  private constructor(
    public readonly collectionName: string,
    public readonly name: string,
    public readonly author: string,
    public readonly allowNotify: boolean,
    public readonly authorizedAccounts: string[],
    public readonly notifyAccounts: string[],
    public readonly marketFee: number,
    public readonly createdAtBlock: bigint,
    public readonly createdAtTime: Date,
    public readonly rest: object
  ) {}

  public toDocument(): AssetCollectionDocument {
    const {
      collectionName: collection_name,
      name,
      author,
      allowNotify: allow_notify,
      authorizedAccounts: authorized_accounts,
      notifyAccounts: notify_accounts,
      marketFee: market_fee,
      createdAtBlock,
      createdAtTime,
      rest,
    } = this;

    const document: AssetCollectionDocument = {
      collection_name,
      name,
      author,
      allow_notify,
      authorized_accounts,
      notify_accounts,
      market_fee,
      ...rest,
    };

    if (createdAtTime) {
      document.created_at_time = createdAtTime;
    }

    if (createdAtBlock) {
      document.created_at_block = MongoDB.Long.fromBigInt(createdAtBlock);
    }

    return removeUndefinedProperties<AssetCollectionDocument>(document);
  }

  /*methods*/
}
