import { ConfigVars, log } from '@alien-worlds/api-core';
import {
  ReaderCommandOptions,
  buildReaderConfig,
  startReader,
} from '@alien-worlds/api-history-tools';
import { Command } from 'commander';

const program = new Command();

const start = async (options: ReaderCommandOptions) => {
  const vars = new ConfigVars();
  const config = buildReaderConfig(vars, options);
  startReader(config).catch(log);
};

program
  .version('1.0', '-v, --version')
  .option('-k, --scan-key <scan-key>', 'Scan key')
  .option('-s, --start-block <start-block>', 'Start at this block')
  .option('-m, --mode <mode>', 'Mode (default/replay/test)')
  .option('-e, --end-block <end-block>', 'End block (exclusive)')
  .option('-t, --threads <threads>', 'Number of threads')
  .parse(process.argv);

start(program.opts<ReaderCommandOptions>());
