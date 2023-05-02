import { log } from '@alien-worlds/api-core';
import { LeaderboardWriter } from './leaderboard.writer';
import { LeaderboardWriterConfig } from './leaderboard.types';

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
