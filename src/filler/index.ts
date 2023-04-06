import { log } from '@alien-worlds/api-core';
import { startFiller } from '@alien-worlds/api-history-tools';
import { Command } from 'commander';
import { buildFillerConfig } from './filler.config';
import { FillerOptions } from './filler.types';
import { buildConfig } from '../config/config';

const program = new Command();

const start = (options: FillerOptions) => {
  const config = buildConfig();
  const fillerConfig = buildFillerConfig(options, config);
  startFiller(fillerConfig).catch(log);
};

program
  .version('1.0', '-v, --version')
  .option('-k, --scan-key <scan-key>', 'Scan key')
  .option('-s, --start-block <start-block>', 'Start at this block')
  .option('-m, --mode <mode>', 'Mode (default/replay/test)')
  .option('-e, --end-block <end-block>', 'End block (exclusive)')
  .parse(process.argv);

start(program.opts<FillerOptions>());
