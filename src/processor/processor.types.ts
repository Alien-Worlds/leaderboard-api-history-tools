import { AtomicAssetsConfig } from '@alien-worlds/alienworlds-api-common';
import { BroadcastConfig, MongoConfig } from '@alien-worlds/api-core';
import { ExtendedLeaderboardConfig } from '../config';
import { LeaderboardUpdateJson } from './leaderboard/data/leaderboard.dtos';

export type ProcessorSharedData = {
  config: {
    mongo: MongoConfig;
    leaderboard: ExtendedLeaderboardConfig;
    atomicassets: AtomicAssetsConfig;
    broadcast: BroadcastConfig;
  };
  updates: LeaderboardUpdateJson[];
  assets: bigint[];
};
