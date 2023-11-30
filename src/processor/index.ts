import {
  process as processorBoot,
  DefaultProcessorDependencies,
  ProcessorCommandOptions,
  ProcessorDependencies,
  log,
  processorCommand,
} from '@alien-worlds/aw-history-starter-kit';
import path from 'path';
import { buildLeaderboardProcessorConfig } from './processor.config';

export const startProcessor = (args: string[]) => {
  const dependencies: ProcessorDependencies = new DefaultProcessorDependencies();
  const options = processorCommand.parse(args).opts<ProcessorCommandOptions>();
  const config = buildLeaderboardProcessorConfig(dependencies, options);

  processorBoot(
    config,
    dependencies,
    path.join(`${__dirname}/`, './processors'),
    path.join(__dirname, '../../leaderboard.featured.json')
  ).catch(log);
};

startProcessor(process.argv);
