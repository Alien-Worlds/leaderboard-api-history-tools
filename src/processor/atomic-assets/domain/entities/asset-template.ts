import {
  parseToBigInt,
  removeUndefinedProperties,
  MongoDB,
} from '@alien-worlds/api-core';
import {
  AssetTemplateDocument,
  AssetTemplateStruct,
} from '../../data/dtos/atomic-assets.dto';

/*imports*/
/**
 *
 * @class
 */
export class AssetTemplate<ImmutableDataType = object> {
  public static fromStruct<ImmutableDataType = object>(
    dto: AssetTemplateStruct<ImmutableDataType>
  ): AssetTemplate<ImmutableDataType> {
    const {
      template_id,
      max_supply,
      issued_supply,
      is_transferable,
      is_burnable,
      immutable_data,
      created_at_time,
      created_at_block,
      ...rest
    } = dto;
    return new AssetTemplate<ImmutableDataType>(
      template_id,
      max_supply,
      issued_supply,
      is_transferable,
      is_burnable,
      immutable_data,
      created_at_time ? new Date(Number(created_at_time)) : null,
      created_at_block ? parseToBigInt(created_at_block) : null,
      rest
    );
  }

  public static fromDocument<ImmutableDataType = object>(
    dto: AssetTemplateDocument<ImmutableDataType>
  ): AssetTemplate<ImmutableDataType> {
    const {
      template_id,
      max_supply,
      issued_supply,
      is_transferable,
      is_burnable,
      immutable_data,
      created_at_time,
      created_at_block,
      ...rest
    } = dto;
    return new AssetTemplate<ImmutableDataType>(
      template_id,
      max_supply,
      issued_supply,
      is_transferable,
      is_burnable,
      immutable_data,
      created_at_time ? new Date(Number(created_at_time)) : null,
      created_at_block ? parseToBigInt(created_at_block) : null,
      rest
    );
  }

  /**
   * @private
   * @constructor
   */
  private constructor(
    public readonly templateId: string,
    public readonly maxSupply: string,
    public readonly issuedSupply: string,
    public readonly isTransferable: boolean,
    public readonly isBurnable: boolean,
    public readonly immutableData: ImmutableDataType,
    public readonly createdAtTime: Date,
    public readonly createdAtBlock: bigint,
    public readonly rest: object
  ) {}

  public toDocument(): AssetTemplateDocument<ImmutableDataType> {
    const {
      templateId,
      maxSupply,
      issuedSupply,
      isTransferable,
      isBurnable,
      immutableData,
      createdAtTime,
      createdAtBlock,
      rest,
    } = this;

    const document: AssetTemplateDocument<ImmutableDataType> = {
      template_id: templateId,
      max_supply: maxSupply,
      issued_supply: issuedSupply,
      is_transferable: isTransferable,
      is_burnable: isBurnable,
      immutable_data: immutableData,
      ...rest,
    };

    if (createdAtTime) {
      document.created_at_time = createdAtTime;
    }

    if (createdAtBlock) {
      document.created_at_block = MongoDB.Long.fromBigInt(createdAtBlock);
    }

    return removeUndefinedProperties<AssetTemplateDocument<ImmutableDataType>>(
      document
    );
  }

  /*methods*/
}
