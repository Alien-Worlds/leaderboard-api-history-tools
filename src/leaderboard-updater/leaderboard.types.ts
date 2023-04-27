import { AtomicAssetsConfig } from '@alien-worlds/alienworlds-api-common';
import { ExtendedLeaderboardConfig } from '../config';
import { MongoConfig } from '@alien-worlds/api-core';
import { WorkersConfig } from '@alien-worlds/api-history-tools';

export type LeaderboardUpdaterCommandOptions = {
  threads: number;
};

export type LeaderboardUpdaterConfig = {
  mongo: MongoConfig;
  leaderboard: ExtendedLeaderboardConfig;
  atomicassets: AtomicAssetsConfig;
  workers: WorkersConfig;
};

export type LeaderboardSharedData = {
  config: {
    mongo: MongoConfig;
    leaderboard: ExtendedLeaderboardConfig;
    atomicassets: AtomicAssetsConfig;
  };
};
