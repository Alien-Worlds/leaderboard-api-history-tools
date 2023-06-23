import { BroadcastConfig, MongoConfig } from '@alien-worlds/api-core';
import { AtomicAssetsConfig } from '@alien-worlds/atomicassets-api-common';
import {
  LeaderboardConfig,
  LeaderboardUpdateJson,
} from '@alien-worlds/leaderboard-api-common';

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
