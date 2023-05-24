import {
  ConfigVars,
  buildBroadcastConfig,
  buildMongoConfig,
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
  const mongo = buildMongoConfig(vars);
  const processorConfig = buildProcessorConfig(vars, featured, options);
  const leaderboard = buildLeaderboardConfig(vars);
  const atomicassets = buildAtomicAssetsConfig(vars);
  const broadcast = buildBroadcastConfig(vars);

  processorConfig.workers.sharedData = {
    config: {
      mongo,
      leaderboard,
      atomicassets,
      broadcast,
    },
    updates: [],
    assets: [],
  };

  processorConfig.processorLoaderPath = `${__dirname}/processor.worker-loader`;

  return processorConfig;
};
