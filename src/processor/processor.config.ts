import { HistoryToolsConfig, ProcessorConfig } from '@alien-worlds/api-history-tools';
import { ProcessorOptions } from './processor.types';

export const buildProcessorConfig = (
  options: ProcessorOptions,
  config: HistoryToolsConfig,
  sharedData?: { [key: string]: unknown }
): ProcessorConfig => {
  const {
    broadcast,
    processor: { workers, taskQueue },
    featured,
    mongo,
    leaderboard,
    atomicassets,
  } = config;

  if (options.threads) {
    workers.threadsCount = options.threads;
  }

  workers.sharedData = {
    config: {
      leaderboard,
      mongo,
      atomicassets,
      broadcast,
    },
    leaderboard: [],
  };

  if (sharedData) {
    Object.assign(workers.sharedData, sharedData);
  }

  return {
    broadcast,
    featured,
    mongo,
    workers,
    queue: taskQueue,
    customProcessorLoaderPath: `${__dirname}/processor.worker-loader`,
  };
};
