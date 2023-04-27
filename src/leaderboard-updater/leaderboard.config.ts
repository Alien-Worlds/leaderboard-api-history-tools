import { ConfigVars, buildMongoConfig } from '@alien-worlds/api-core';
import { buildAtomicAssetsConfig, buildLeaderboardConfig } from '../config';
import {
  LeaderboardUpdaterCommandOptions,
  LeaderboardUpdaterConfig,
} from './leaderboard.types';
import { WorkersConfig } from '@alien-worlds/api-history-tools';

export const buildLeaderboardUpdaterWorkersConfig = (
  vars: ConfigVars,
  threadsCount?: number
): WorkersConfig => ({
  threadsCount: threadsCount || vars.getNumberEnv('LEADERBOARD_UPDATER_MAX_THREADS'),
  inviolableThreadsCount: vars.getNumberEnv(
    'LEADERBOARD_UPDATER_INVIOLABLE_THREADS_COUNT'
  ),
});

export const buildLeaderboardUpdaterConfig = (
  options: LeaderboardUpdaterCommandOptions
): LeaderboardUpdaterConfig => {
  const vars = new ConfigVars();
  const mongo = buildMongoConfig(vars);
  const leaderboard = buildLeaderboardConfig(vars);
  const atomicassets = buildAtomicAssetsConfig(vars);
  const workers = buildLeaderboardUpdaterWorkersConfig(vars, options.threads);

  const config = {
    leaderboard,
    atomicassets,
    mongo,
    workers,
  };

  config.workers.sharedData = {
    config: {
      mongo,
      leaderboard,
      atomicassets,
    },
  };

  return config;
};
