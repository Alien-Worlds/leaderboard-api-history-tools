import { buildConfig } from './../config/config';
import { log } from '@alien-worlds/api-core';
import { startBlockRange } from '@alien-worlds/api-history-tools';
import { Command } from 'commander';
import { buildBlockRangeConfig } from './block-range.config';
import { BlockRangeOptions } from './block-range.types';

const program = new Command();

const start = async (options: BlockRangeOptions) => {
  const config = buildConfig();
  // setup process config
  const blockRangeConfig = buildBlockRangeConfig(options, config);

  startBlockRange(blockRangeConfig).catch(log);
};

program
  .version('1.0', '-v, --version')
  .option('-k, --scan-key <scan-key>', 'Scan key')
  .option('-m, --mode <mode>', 'Mode (default/replay/test)')
  .option('-t, --threads <threads>', 'Number of threads')
  .parse(process.argv);

start(program.opts<BlockRangeOptions>());
