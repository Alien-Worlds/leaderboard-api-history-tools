import { log } from '@alien-worlds/api-core';
import { Command } from 'commander';
import { buildLeaderboardUpdaterConfig } from './leaderboard.config';
import { LeaderboardUpdaterCommandOptions } from './leaderboard.types';
import { startLeaderboardUpdater } from './start-leaderboard-updater';

const program = new Command();

const start = async (options: LeaderboardUpdaterCommandOptions) => {
  const config = buildLeaderboardUpdaterConfig(options);
  startLeaderboardUpdater(config).catch(log);
};

program
  .version('1.0', '-v, --version')
  .option('-t, --threads <threads>', 'Number of threads')
  .parse(process.argv);

start(program.opts<LeaderboardUpdaterCommandOptions>()).catch(log);
