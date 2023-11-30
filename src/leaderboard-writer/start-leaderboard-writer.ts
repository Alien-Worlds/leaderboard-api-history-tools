import { LeaderboardWriter } from './leaderboard.writer';
import { LeaderboardWriterConfig } from './leaderboard.types';
import { log } from '@alien-worlds/aw-history-starter-kit';

/**
 *
 * @param mongo
 * @param leaderboard
 * @param atomicassets
 */
export const startLeaderboardWriter = async (config: LeaderboardWriterConfig) => {
  log(`Leaderboard Writer ... [starting]`);
  const updater = await LeaderboardWriter.create(config);

  // start updating leaderboard
  updater.next();

  log(`Leaderboard Writer ... [ready]`);
};
