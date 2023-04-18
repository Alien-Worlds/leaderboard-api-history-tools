import { log } from '@alien-worlds/api-core';
import {
  ProcessorCommandOptions,
  startProcessor,
} from '@alien-worlds/api-history-tools';
import { Command } from 'commander';
import { buildLeaderboardProcessorConfig } from './processor.config';

const program = new Command();

const start = async (options: ProcessorCommandOptions) => {
  const config = buildLeaderboardProcessorConfig(options);
  startProcessor(config).catch(log);
};

program
  .version('1.0', '-v, --version')
  .option('-t, --threads <threads>', 'Number of threads')
  .parse(process.argv);

start(program.opts<ProcessorCommandOptions>()).catch(log);
