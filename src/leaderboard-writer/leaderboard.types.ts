import { MongoConfig } from '@alien-worlds/api-core';
import { WorkersConfig } from '@alien-worlds/api-history-tools';
import { AtomicAssetsConfig } from '@alien-worlds/atomicassets-api-common';
import { LeaderboardConfig } from '@alien-worlds/leaderboard-api-common';

export type LeaderboardWriterCommandOptions = {
  threads: number;
};

export type LeaderboardWriterConfig = {
  mongo: MongoConfig;
  leaderboard: LeaderboardConfig;
  atomicassets: AtomicAssetsConfig;
  workers: WorkersConfig;
  updateBatchSize: number;
};

export type LeaderboardSharedData = {
  config: {
    mongo: MongoConfig;
    leaderboard: LeaderboardConfig;
    atomicassets: AtomicAssetsConfig;
    updateBatchSize: number;
  };
};
