import {
  AtomicAssetsConfig,
  LeaderboardServiceConfig,
} from '@alien-worlds/alienworlds-api-common';
import { BroadcastConfig } from '@alien-worlds/api-core';
import { HistoryToolsConfig } from '@alien-worlds/api-history-tools';

export type LeaderboardHistoryToolsConfig = HistoryToolsConfig & {
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
