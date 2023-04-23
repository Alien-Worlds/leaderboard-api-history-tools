import { ExtendedLeaderboardServiceConfig } from './../config';
import { MongoSource, log } from '@alien-worlds/api-core';
import { LeaderboardUpdateBackupRepository } from '../processor/leaderboard/domain/repositories/leaderboard-update.repository';
import { postLeaderboard } from '../processor/leaderboard/leaderboard.utils';

export const updateLeaderboard = async (
  config: ExtendedLeaderboardServiceConfig,
  mongoSource: MongoSource
) => {
  log(`[CRON] Checking for unsent leaderboard updates...`);
  const backup = new LeaderboardUpdateBackupRepository(mongoSource);

  const { content, failure: extractFailure } = await backup.extractAll();

  if (extractFailure) {
    log(`[CRON] ${extractFailure.error.message}`);
    return;
  }

  log(`[CRON] Backup size: ${content.length} items.`);

  if (content.length === 0) {
    return;
  }

  postLeaderboard(config, content, structs => {
    log(`[CRON] Sending failed. Backup again.`);
    backup.add(structs);
  });
};
