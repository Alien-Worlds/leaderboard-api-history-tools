/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { BlockRangeConfig, HistoryToolsConfig } from '@alien-worlds/api-history-tools';
import { BlockRangeOptions } from './block-range.types';

export const buildBlockRangeConfig = (
  options: BlockRangeOptions,
  config: HistoryToolsConfig
): BlockRangeConfig => {
  const { scanKey, threads, mode } = options;

  const {
    broadcast,
    blockReader,
    contractReader,
    mongo,
    scanner,
    featured,
    abis,
    blockRange: { workers },
  } = config;

  const blockRangeConfig: BlockRangeConfig = {
    broadcast,
    blockReader,
    contractReader,
    mongo,
    scanner,
    featured,
    abis: abis.service,
    workers,
    scanKey,
  };

  if (scanKey) {
    blockRangeConfig.scanKey = scanKey;
    blockRangeConfig.scanner.scanKey = scanKey;
  }

  if (threads) {
    blockRangeConfig.workers.threadsCount = threads;
  }

  if (mode) {
    blockRangeConfig.mode = mode || config.mode;
  }

  return blockRangeConfig;
};
