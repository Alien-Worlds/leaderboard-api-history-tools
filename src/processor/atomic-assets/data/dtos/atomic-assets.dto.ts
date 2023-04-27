import { MongoDB } from '@alien-worlds/api-core';

export type AssetCollectionStruct = {
  collection_name?: string;
  name?: string;
  author?: string;
  allow_notify?: boolean;
  authorized_accounts?: string[];
  notify_accounts?: string[];
  market_fee?: number;
  created_at_block?: string;
  created_at_time?: string;
  [key: string]: unknown;
};

export type AssetCollectionDocument = {
  collection_name?: string;
  name?: string;
  author?: string;
  allow_notify?: boolean;
  authorized_accounts?: string[];
  notify_accounts?: string[];
  market_fee?: number;
  created_at_block?: MongoDB.Long;
  created_at_time?: Date;
  [key: string]: unknown;
};

export type SchemaFormat = {
  name?: string;
  type?: string;
  [key: string]: unknown;
};

export type AssetSchemaStruct = {
  schema_name?: string;
  format?: SchemaFormat[];
  created_at_block?: string;
  created_at_time?: string;
  [key: string]: unknown;
};

export type AssetSchemaDocument = {
  schema_name?: string;
  format?: SchemaFormat[];
  created_at_block?: MongoDB.Long;
  created_at_time?: Date;
  [key: string]: unknown;
};

export type AssetTemplateStruct<ImmutableDataType = object> = {
  template_id?: string;
  max_supply?: string;
  issued_supply?: string;
  is_transferable?: boolean;
  is_burnable?: boolean;
  immutable_data?: ImmutableDataType;
  created_at_time?: string;
  created_at_block?: string;
  [key: string]: unknown;
};

export type AssetTemplateDocument<ImmutableDataType = object> = {
  template_id?: string;
  max_supply?: string;
  issued_supply?: string;
  is_transferable?: boolean;
  is_burnable?: boolean;
  immutable_data?: ImmutableDataType;
  created_at_time?: Date;
  created_at_block?: MongoDB.Long;
  [key: string]: unknown;
};

export type BackedTokenDocument = {
  token_contract?: string;
  token_symbol?: string;
  token_precision?: number;
  amount?: string;
  [key: string]: unknown;
};

export type BackedTokenStruct = BackedTokenDocument;

export type AtomicAssetStruct<ImmutableDataType = object> = {
  contract?: string;
  asset_id?: string;
  owner?: string;
  name?: string;
  is_transferable?: boolean;
  is_burnable?: boolean;
  template_mint?: string;
  collection?: AssetCollectionStruct;
  schema?: AssetSchemaStruct;
  template?: AssetTemplateStruct<ImmutableDataType>;
  backed_tokens?: BackedTokenStruct[];
  immutable_data?: object;
  mutable_data?: object;
  data?: ImmutableDataType;
  burned_by_account?: string;
  burned_at_block?: string;
  burned_at_time?: string;
  updated_at_block?: string;
  updated_at_time?: string;
  transferred_at_block?: string;
  transferred_at_time?: string;
  minted_at_block?: string;
  minted_at_time?: string;
  [key: string]: unknown;
};

export type AtomicAssetDocument<ImmutableDataType = object> = {
  _id?: MongoDB.ObjectId;
  contract?: string;
  asset_id?: MongoDB.Long;
  owner?: string;
  name?: string;
  is_transferable?: boolean;
  is_burnable?: boolean;
  template_mint?: string;
  collection?: AssetCollectionDocument;
  schema?: AssetSchemaDocument;
  template?: AssetTemplateDocument<ImmutableDataType>;
  backed_tokens?: BackedTokenDocument[];
  immutable_data?: object;
  mutable_data?: object;
  data?: ImmutableDataType;
  burned_by_account?: string;
  burned_at_block?: MongoDB.Long;
  burned_at_time?: Date;
  updated_at_block?: MongoDB.Long;
  updated_at_time?: Date;
  transferred_at_block?: MongoDB.Long;
  transferred_at_time?: Date;
  minted_at_block?: MongoDB.Long;
  minted_at_time?: Date;
  [key: string]: unknown;
};

export type AtomicAssetsDownloadDocument = {
  id?: MongoDB.ObjectId;
  asset_id?: MongoDB.Long;
  leaderboard_update_id?: string;
  [key: string]: unknown;
};