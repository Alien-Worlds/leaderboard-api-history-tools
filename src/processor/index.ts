import { log } from '@alien-worlds/api-core';
import { startProcessor } from '@alien-worlds/api-history-tools';
import { Command } from 'commander';
import { buildProcessorConfig } from './processor.config';
import { ProcessorOptions } from './processor.types';
import { buildConfig } from '../config/config';

const program = new Command();

const start = async (options: ProcessorOptions) => {
  // setup process config
  const config = buildConfig();
  const processorConfig = buildProcessorConfig(options, config);

  startProcessor(processorConfig).catch(log);
};

program
  .version('1.0', '-v, --version')
  .option('-t, --threads <threads>', 'Number of threads')
  .parse(process.argv);

start(program.opts<ProcessorOptions>()).catch(log);
