import { BroadcastConfig } from '@alien-worlds/api-core';
import { HistoryToolsConfig } from '@alien-worlds/api-history-tools';
import { AtomicAssetsConfig } from '@alien-worlds/atomicassets-api-common';
import { LeaderboardConfig } from '@alien-worlds/leaderboard-api-common';

export type LeaderboardHistoryToolsConfig = HistoryToolsConfig & {
  externalBroadcast: BroadcastConfig;
  leaderboard: LeaderboardConfig;
  atomicassets: AtomicAssetsConfig;
  cron: CronConfig;
};

export type CronConfig = {
  [key: string]: unknown;
};
