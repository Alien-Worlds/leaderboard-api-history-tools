import {
  AtomicAssetsConfig,
  LeaderboardConfig,
} from '@alien-worlds/alienworlds-api-common';
import { BroadcastConfig } from '@alien-worlds/api-core';
import { HistoryToolsConfig } from '@alien-worlds/api-history-tools';

export type LeaderboardHistoryToolsConfig = HistoryToolsConfig & {
  externalBroadcast: BroadcastConfig;
  leaderboard: LeaderboardConfig;
  atomicassets: AtomicAssetsConfig;
  cron: CronConfig;
};

export type CronConfig = {
  [key: string]: unknown;
};
