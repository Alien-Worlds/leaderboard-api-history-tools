import {
  AtomicAssetsConfig,
  LeaderboardConfig,
} from '@alien-worlds/alienworlds-api-common';
import { MongoConfig } from '@alien-worlds/api-core';
import { WorkersConfig } from '@alien-worlds/api-history-tools';

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
