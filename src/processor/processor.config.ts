import {
  ConfigVars,
  buildBroadcastConfig,
} from '@alien-worlds/api-core';
import {
  ProcessorCommandOptions,
  ProcessorConfig,
  buildProcessorConfig,
} from '@alien-worlds/api-history-tools';
import featured from '../featured';
import { buildAtomicAssetsConfig, buildLeaderboardConfig } from '../config';

export const buildLeaderboardProcessorConfig = (
  options: ProcessorCommandOptions
): ProcessorConfig => {
  const vars = new ConfigVars();
  const processorConfig = buildProcessorConfig(vars, featured, options);
  const leaderboard = buildLeaderboardConfig(vars);
  const atomicassets = buildAtomicAssetsConfig(vars);
  const broadcast = buildBroadcastConfig(vars);

  processorConfig.workers.sharedData = {
    config: {
      leaderboard,
      atomicassets,
      broadcast,
    },
    leaderboard: [],
  };

  processorConfig.processorLoaderPath = `${__dirname}/processor.worker-loader`;

  return processorConfig;
};
