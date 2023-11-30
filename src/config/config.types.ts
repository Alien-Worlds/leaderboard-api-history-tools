import { AtomicAssetsConfig } from '@alien-worlds/aw-api-common-atomicassets';
import { LeaderboardConfig } from '@alien-worlds/aw-api-common-leaderboard';
import {
  HistoryToolsConfig,
  BroadcastConfig,
} from '@alien-worlds/aw-history-starter-kit';

export type LeaderboardHistoryToolsConfig = HistoryToolsConfig & {
  externalBroadcast: BroadcastConfig;
  leaderboard: LeaderboardConfig;
  atomicassets: AtomicAssetsConfig;
  cron: CronConfig;
};

export type CronConfig = {
  [key: string]: unknown;
};
