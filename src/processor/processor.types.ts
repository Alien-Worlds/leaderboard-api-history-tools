import { AtomicAssetsConfig } from '@alien-worlds/aw-api-common-atomicassets';
import {
  LeaderboardConfig,
  LeaderboardUpdateJson,
} from '@alien-worlds/aw-api-common-leaderboard';
import { BroadcastConfig, MongoConfig } from '@alien-worlds/aw-history-starter-kit';

export type ProcessorSharedData = {
  config: {
    mongo: MongoConfig;
    leaderboard: LeaderboardConfig;
    atomicassets: AtomicAssetsConfig;
    broadcast: BroadcastConfig;
  };
  updates: LeaderboardUpdateJson[];
  assets: bigint[];
};
