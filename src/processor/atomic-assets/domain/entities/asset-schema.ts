import {
  parseToBigInt,
  removeUndefinedProperties,
  MongoDB,
} from '@alien-worlds/api-core';
import {
  AssetSchemaDocument,
  AssetSchemaStruct,
  SchemaFormat,
} from '../../data/dtos/atomic-assets.dto';

/*imports*/
/**
 *
 * @class
 */
export class AssetSchema {
  public static fromStruct(dto: AssetSchemaStruct): AssetSchema {
    const { schema_name, format, created_at_block, created_at_time, ...rest } =
      dto;
    return new AssetSchema(
      schema_name,
      format,
      created_at_block ? parseToBigInt(created_at_block) : null,
      created_at_time ? new Date(Number(created_at_time)) : null,
      rest
    );
  }

  public static fromDocument(dto: AssetSchemaDocument): AssetSchema {
    const { schema_name, format, created_at_block, created_at_time, ...rest } =
      dto;
    return new AssetSchema(
      schema_name,
      format,
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
    public readonly schemaName: string,
    public readonly format: SchemaFormat[],
    public readonly createdAtBlock: bigint,
    public readonly createdAtTime: Date,
    public readonly rest: object
  ) {}

  public toDocument(): AssetSchemaDocument {
    const { schemaName, format, createdAtBlock, createdAtTime, rest } = this;

    const document: AssetSchemaDocument = {
      schema_name: schemaName,
      format,
      ...rest,
    };

    if (createdAtTime) {
      document.created_at_time = createdAtTime;
    }

    if (createdAtBlock) {
      document.created_at_block = MongoDB.Long.fromBigInt(createdAtBlock);
    }

    return removeUndefinedProperties<AssetSchemaDocument>(document);
  }

  /*methods*/
}
