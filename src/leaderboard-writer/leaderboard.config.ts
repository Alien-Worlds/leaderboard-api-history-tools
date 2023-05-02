import { ConfigVars, buildMongoConfig } from '@alien-worlds/api-core';
import { buildAtomicAssetsConfig, buildLeaderboardConfig } from '../config';
import {
  LeaderboardWriterCommandOptions,
  LeaderboardWriterConfig,
} from './leaderboard.types';
import { WorkersConfig } from '@alien-worlds/api-history-tools';

export const buildLeaderboardWriterWorkersConfig = (
  vars: ConfigVars,
  threadsCount?: number
): WorkersConfig => ({
  threadsCount: threadsCount || vars.getNumberEnv('LEADERBOARD_WRITER_MAX_THREADS'),
  inviolableThreadsCount: vars.getNumberEnv(
    'LEADERBOARD_WRITER_INVIOLABLE_THREADS_COUNT'
  ),
});

export const buildLeaderboardWriterConfig = (
  options: LeaderboardWriterCommandOptions
): LeaderboardWriterConfig => {
  const vars = new ConfigVars();
  const mongo = buildMongoConfig(vars);
  const leaderboard = buildLeaderboardConfig(vars);
  const atomicassets = buildAtomicAssetsConfig(vars);
  const workers = buildLeaderboardWriterWorkersConfig(vars, options.threads);
  const updateBatchSize =
    vars.getNumberEnv('LEADERBOARD_WRITER_UPDATE_BATCH_SIZE') || 1000;

  const config = {
    leaderboard,
    atomicassets,
    mongo,
    workers,
    updateBatchSize,
  };

  config.workers.sharedData = {
    config: {
      mongo,
      leaderboard,
      atomicassets,
      updateBatchSize,
    },
  };

  return config;
};
