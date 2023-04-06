import {
  AtomicAssetsConfig,
  LeaderboardServiceConfig,
} from '@alien-worlds/alienworlds-api-common';
import { BroadcastConfig } from '@alien-worlds/api-core';
import { HistoryToolsConfig } from '@alien-worlds/api-history-tools';

export type Environment = {
  MONGO_HOSTS?: string;
  MONGO_PORTS?: string;
  MONGO_USER?: string;
  MONGO_PASSWORD?: string;
  MONGO_SRV?: number;
  MONGO_SSL?: number;
  MONGO_REPLICA_SET?: string;
  MONGO_AUTH_MECHANISM?: string;
  MONGO_AUTH_SOURCE?: string;
  MONGO_DB_NAME?: string;
  BROADCAST_URL?: string;
  BROADCAST_PORT?: string;
  BROADCAST_HOST?: string;
  BROADCAST_DRIVER?: string;
  EXTERNAL_BROADCAST_PORT?: string;
  EXTERNAL_BROADCAST_HOST?: string;
  EXTERNAL_BROADCAST_DRIVER?: string;
  BLOCKCHAIN_ENDPOINT?: string;
  BLOCKCHAIN_CHAIN_ID?: string;
  SCANNER_NODES_MAX_CHUNK_SIZE?: string;
  SCANNER_SCAN_KEY?: string;
  BLOCK_READER_ENDPOINTS?: string;
  BLOCK_READER_FETCH_DELTAS?: string;
  BLOCK_READER_FETCH_TRACES?: string;
  START_BLOCK?: string;
  END_BLOCK?: string;
  MODE?: string;
  START_FROM_HEAD?: number;
  HYPERION_URL?: string;
  ABIS_SERVICE_LIMIT?: string;
  ABIS_SERVICE_FILTER?: string;
  BLOCK_RANGE_MAX_THREADS?: string;
  BLOCK_RANGE_INVIOLABLE_THREADS_COUNT?: string;
  PROCESSOR_MAX_THREADS?: string;
  PROCESSOR_INVIOLABLE_THREADS_COUNT?: string;
  PROCESSOR_BINDINGS_PATH?: string;
  PROCESSOR_QUEUE_WRITE_CONCERN?: string;
  PROCESSOR_QUEUE_READ_PREFERENCE?: string;
  PROCESSOR_QUEUE_READ_CONCERN?: string;
  PROCESSOR_USE_SESSION?: number;
  LEADERBOARD_API_PORT?: number;
  LEADERBOARD_API_HOST?: string;
  LEADERBOARD_API_SECURE?: number;
  LEADERBOARD_API_BATCH_SIZE?: number;
  LEADERBOARD_UPDATE_CRON_TIME?: string;
  LEADERBOARD_TOKEN_SECRET_KEY?: string;
  LEADERBOARD_TOKEN_EXPIRATION_TIME?: string;
  LEADERBOARD_TOKEN?: string;
  ATOMICASSETS_API_PORT?: number;
  ATOMICASSETS_API_HOST?: string;
  ATOMICASSETS_API_SECURE?: number;
};

export type AlienworldsHistoryToolsConfig = HistoryToolsConfig & {
  externalBroadcast: BroadcastConfig;
  leaderboard: ExtendedLeaderboardServiceConfig;
  atomicassets: AtomicAssetsConfig;
  cron: CronConfig;
};

export type ExtendedLeaderboardServiceConfig = LeaderboardServiceConfig & {
  batchSize: number;
  secretKey: string;
  expirationTime: string;
  token?: string;
};

export type CronConfig = {
  leaderboardUpdateTime: string;
};
