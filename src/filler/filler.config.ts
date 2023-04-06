import { parseToBigInt } from '@alien-worlds/api-core';
import { FillerConfig, HistoryToolsConfig } from '@alien-worlds/api-history-tools';
import { FillerOptions } from './filler.types';

export const buildFillerConfig = (
  options: FillerOptions,
  config: HistoryToolsConfig
): FillerConfig => {
  const {
    scanner,
    startBlock,
    endBlock,
    mode,
    broadcast,
    blockchain,
    mongo,
    abis,
    featured,
    contractReader,
    startFromHead,
  } = config;

  const fillerConfig = {
    broadcast,
    blockchain,
    scanner,
    mongo,
    startBlock,
    endBlock,
    mode,
    startFromHead,
    featured,
    contractReader,
    abis: abis.service,
  };

  if (options.startBlock) {
    fillerConfig.startBlock = parseToBigInt(options.startBlock);
  }

  if (options.endBlock) {
    fillerConfig.endBlock = parseToBigInt(options.endBlock);
  }

  if (options.mode) {
    fillerConfig.mode = options.mode;
  }

  return fillerConfig;
};
