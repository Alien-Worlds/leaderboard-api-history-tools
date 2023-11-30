import { buildAtomicAssetsConfig, buildLeaderboardConfig } from '../config';
import {
  ProcessorCommandOptions,
  ProcessorConfig,
  ConfigVars,
  buildProcessorConfig,
  ProcessorDependencies,
} from '@alien-worlds/aw-history-starter-kit';

export const buildLeaderboardProcessorConfig = (
  dependencies: ProcessorDependencies,
  options: ProcessorCommandOptions
): ProcessorConfig => {
  const vars = new ConfigVars();
  const config = buildProcessorConfig(vars, dependencies.databaseConfigBuilder, options);

  const leaderboard = buildLeaderboardConfig(vars);
  const atomicassets = buildAtomicAssetsConfig(vars);
  // const broadcast = buildBroadcastConfig(vars);

  config.workers.sharedData = {
    config: {
      leaderboard,
      atomicassets,
    },
    updates: [],
    assets: [],
  };

  return config;
};
