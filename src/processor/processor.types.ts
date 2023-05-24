import {
  AtomicAssetsConfig,
  LeaderboardConfig,
  LeaderboardUpdateJson,
} from '@alien-worlds/alienworlds-api-common';
import { BroadcastConfig, MongoConfig } from '@alien-worlds/api-core';

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
