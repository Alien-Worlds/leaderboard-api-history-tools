
import { Command } from 'commander';
import { buildLeaderboardWriterConfig } from './leaderboard.config';
import { LeaderboardWriterCommandOptions } from './leaderboard.types';
import { startLeaderboardWriter } from './start-leaderboard-writer';
import { log } from '@alien-worlds/aw-history-starter-kit';

const program = new Command();

const start = async (options: LeaderboardWriterCommandOptions) => {
  const config = buildLeaderboardWriterConfig(options);
  startLeaderboardWriter(config).catch(log);
};

program
  .version('1.0', '-v, --version')
  .option('-t, --threads <threads>', 'Number of threads')
  .parse(process.argv);

start(program.opts<LeaderboardWriterCommandOptions>()).catch(log);
