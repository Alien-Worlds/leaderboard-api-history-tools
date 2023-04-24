import {
  parseToBigInt,
  removeUndefinedProperties,
  MongoDB,
} from '@alien-worlds/api-core';
import {
  AtomicAssetDocument,
  AtomicAssetStruct,
} from '../../data/dtos/atomic-assets.dto';
import { AssetCollection } from './asset-collection';
import { AssetSchema } from './asset-schema';
import { AssetTemplate } from './asset-template';
import { BackedToken } from './backed-token';

/*imports*/
/**
 *
 * @class
 */
export class AtomicAsset<ImmutableDataType = object> {
  public static create<ImmutableDataType = object>(
    struct: AtomicAssetStruct<ImmutableDataType>
  ): AtomicAsset<ImmutableDataType> {
    const {
      contract,
      asset_id,
      owner,
      name,
      is_transferable,
      is_burnable,
      template_mint,
      collection,
      schema,
      template,
      backed_tokens,
      immutable_data,
      mutable_data,
      data,
      burned_by_account,
      burned_at_block,
      burned_at_time,
      updated_at_block,
      updated_at_time,
      transferred_at_block,
      transferred_at_time,
      minted_at_block,
      minted_at_time,
      ...rest
    } = struct;
    return new AtomicAsset<ImmutableDataType>(
      contract,
      parseToBigInt(asset_id),
      owner,
      name,
      is_transferable,
      is_burnable,
      template_mint,
      AssetCollection.fromStruct(collection),
      AssetSchema.fromStruct(schema),
      AssetTemplate.fromStruct<ImmutableDataType>(template),
      backed_tokens.map(BackedToken.fromStruct),
      immutable_data,
      mutable_data,
      data,
      burned_by_account,
      burned_at_block ? parseToBigInt(burned_at_block) : null,
      burned_at_time ? new Date(Number(burned_at_time)) : null,
      updated_at_block ? parseToBigInt(updated_at_block) : null,
      updated_at_time ? new Date(Number(updated_at_time)) : null,
      transferred_at_block ? parseToBigInt(transferred_at_block) : null,
      transferred_at_time ? new Date(Number(transferred_at_time)) : null,
      minted_at_block ? parseToBigInt(minted_at_block) : null,
      minted_at_time ? new Date(Number(minted_at_time)) : null,
      null,
      rest
    );
  }

  public static fromDocument<ImmutableDataType = object>(
    dto: AtomicAssetDocument<ImmutableDataType>
  ): AtomicAsset<ImmutableDataType> {
    const {
      contract,
      asset_id,
      owner,
      name,
      is_transferable,
      is_burnable,
      template_mint,
      collection,
      schema,
      template,
      backed_tokens,
      immutable_data,
      mutable_data,
      data,
      burned_by_account,
      burned_at_block,
      burned_at_time,
      updated_at_block,
      updated_at_time,
      transferred_at_block,
      transferred_at_time,
      minted_at_block,
      minted_at_time,
      _id,
      ...rest
    } = dto;
    return new AtomicAsset<ImmutableDataType>(
      contract,
      parseToBigInt(asset_id),
      owner,
      name,
      is_transferable,
      is_burnable,
      template_mint,
      AssetCollection.fromDocument(collection),
      AssetSchema.fromDocument(schema),
      AssetTemplate.fromDocument<ImmutableDataType>(template),
      backed_tokens.map(token => BackedToken.fromDocument(token)),
      immutable_data,
      mutable_data,
      data,
      burned_by_account,
      burned_at_block ? parseToBigInt(burned_at_block) : null,
      burned_at_time ? new Date(Number(burned_at_time)) : null,
      updated_at_block ? parseToBigInt(updated_at_block) : null,
      updated_at_time ? new Date(Number(updated_at_time)) : null,
      transferred_at_block ? parseToBigInt(transferred_at_block) : null,
      transferred_at_time ? new Date(Number(transferred_at_time)) : null,
      minted_at_block ? parseToBigInt(minted_at_block) : null,
      minted_at_time ? new Date(Number(minted_at_time)) : null,
      _id instanceof MongoDB.ObjectId ? _id.toString() : '',
      rest
    );
  }

  /**
   * @private
   * @constructor
   */
  private constructor(
    public readonly contract: string,
    public readonly assetId: bigint,
    public readonly owner: string,
    public readonly name: string,
    public readonly isTransferable: boolean,
    public readonly isBurnable: boolean,
    public readonly templateMint: string,
    public readonly collection: AssetCollection,
    public readonly schema: AssetSchema,
    public readonly template: AssetTemplate<ImmutableDataType>,
    public readonly backedTokens: BackedToken[],
    public readonly immutableData: object,
    public readonly mutableData: object,
    public readonly data: ImmutableDataType,
    public readonly burnedByAccount: string,
    public readonly burnedAtBlock: bigint,
    public readonly burnedAtTime: Date,
    public readonly updatedAtBlock: bigint,
    public readonly updatedAtTime: Date,
    public readonly transferredAtBlock: bigint,
    public readonly transferredAtTime: Date,
    public readonly mintedAtBlock: bigint,
    public readonly mintedAtTime: Date,
    public readonly id: string,
    public readonly rest: object
  ) {}

  public toDocument(): AtomicAssetDocument {
    const {
      contract,
      assetId,
      owner,
      name,
      isTransferable,
      isBurnable,
      templateMint,
      collection,
      schema,
      template,
      backedTokens,
      immutableData,
      mutableData,
      data,
      burnedByAccount,
      burnedAtBlock,
      burnedAtTime,
      updatedAtBlock,
      updatedAtTime,
      transferredAtBlock,
      transferredAtTime,
      mintedAtBlock,
      mintedAtTime,
      id,
      rest,
    } = this;

    const document: AtomicAssetDocument<ImmutableDataType> = {
      contract,
      asset_id: MongoDB.Long.fromBigInt(assetId),
      owner,
      name,
      is_transferable: isTransferable,
      is_burnable: isBurnable,
      template_mint: templateMint,
      collection: collection.toDocument(),
      schema: schema.toDocument(),
      template: template.toDocument(),
      backed_tokens: backedTokens.map(token => token.toDocument()),
      immutable_data: immutableData,
      mutable_data: mutableData,
      data,
      ...rest,
    };

    if (burnedByAccount) {
      document.burned_by_account = burnedByAccount;
    }

    if (burnedAtBlock) {
      document.burned_at_block = MongoDB.Long.fromBigInt(burnedAtBlock);
    }

    if (burnedAtTime) {
      document.burned_at_time = burnedAtTime;
    }

    if (updatedAtBlock) {
      document.updated_at_block = MongoDB.Long.fromBigInt(updatedAtBlock);
    }

    if (updatedAtTime) {
      document.updated_at_time = updatedAtTime;
    }

    if (transferredAtBlock) {
      document.transferred_at_block =
        MongoDB.Long.fromBigInt(transferredAtBlock);
    }

    if (transferredAtTime) {
      document.transferred_at_time = transferredAtTime;
    }

    if (mintedAtBlock) {
      document.minted_at_block = MongoDB.Long.fromBigInt(mintedAtBlock);
    }

    if (mintedAtTime) {
      document.minted_at_time = mintedAtTime;
    }

    if (id) {
      document._id = new MongoDB.ObjectId(id);
    }

    return removeUndefinedProperties<AtomicAssetDocument>(document);
  }

  /*methods*/
}
