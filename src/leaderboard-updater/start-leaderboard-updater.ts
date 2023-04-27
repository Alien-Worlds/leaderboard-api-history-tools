import { log } from '@alien-worlds/api-core';
import { LeaderboardUpdater } from './leaderboard.updater';
import { LeaderboardUpdaterConfig } from './leaderboard.types';

/**
 *
 * @param mongo
 * @param leaderboard
 * @param atomicassets
 */
export const startLeaderboardUpdater = async (config: LeaderboardUpdaterConfig) => {
  log(`Leaderboard Updater ... [starting]`);
  const updater = await LeaderboardUpdater.create(config);

  // start updating leaderboard
  updater.next();

  log(`Leaderboard Updater ... [ready]`);
};
