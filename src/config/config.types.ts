import {
  AtomicAssetsConfig,
  LeaderboardServiceConfig,
} from '@alien-worlds/alienworlds-api-common';
import { BroadcastConfig, RedisConfig } from '@alien-worlds/api-core';
import { HistoryToolsConfig } from '@alien-worlds/api-history-tools';

export type LeaderboardHistoryToolsConfig = HistoryToolsConfig & {
  externalBroadcast: BroadcastConfig;
  leaderboard: ExtendedLeaderboardConfig;
  atomicassets: AtomicAssetsConfig;
  cron: CronConfig;
};

export type ExtendedLeaderboardConfig = LeaderboardServiceConfig & {
  redis: RedisConfig;
  batchSize: number;
  archiveBatchSize: number;
  secretKey: string;
  expirationTime: string;
  token?: string;
};

export type CronConfig = {
  leaderboardUpdateTime: string;
  leaderboardUpdateBatchSize: number;
};
