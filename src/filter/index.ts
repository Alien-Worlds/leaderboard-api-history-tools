import { ConfigVars, log } from '@alien-worlds/api-core';
import {
  FilterCommandOptions,
  buildFilterConfig,
  startFilter,
} from '@alien-worlds/api-history-tools';
import { Command } from 'commander';
import featured from '../featured';

const program = new Command();

const start = async (options: FilterCommandOptions) => {
  const vars = new ConfigVars();
  const config = buildFilterConfig(vars, featured, options);
  startFilter(config).catch(log);
};

program
  .version('1.0', '-v, --version')
  .option('-k, --scan-key <scan-key>', 'Scan key')
  .option('-m, --mode <mode>', 'Mode (default/replay/test)')
  .option('-t, --threads <threads>', 'Number of threads')
  .parse(process.argv);

start(program.opts<FilterCommandOptions>());
