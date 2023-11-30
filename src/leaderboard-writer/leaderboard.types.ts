import { AtomicAssetsConfig } from "@alien-worlds/aw-api-common-atomicassets";
import { LeaderboardConfig } from "@alien-worlds/aw-api-common-leaderboard";
import { MongoConfig, WorkersConfig } from "@alien-worlds/aw-history-starter-kit";

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
