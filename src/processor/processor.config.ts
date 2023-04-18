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
import { buildAtomicAssetsConfig, buildLeaderboardServiceConfig } from '../config';

export const buildLeaderboardProcessorConfig = (
  options: ProcessorCommandOptions
): ProcessorConfig => {
  const vars = new ConfigVars();
  const processorConfig = buildProcessorConfig(vars, featured, options);
  const leaderboard = buildLeaderboardServiceConfig(vars);
  const mongo = buildMongoConfig(vars);
  const atomicassets = buildAtomicAssetsConfig(vars);
  const broadcast = buildBroadcastConfig(vars);

  processorConfig.workers.sharedData = {
    config: {
      leaderboard,
      mongo,
      atomicassets,
      broadcast,
    },
    leaderboard: [],
  };

  processorConfig.processorLoaderPath = `${__dirname}/processor.worker-loader`;

  return processorConfig;
};
