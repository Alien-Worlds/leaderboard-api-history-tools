import { ConfigVars, MongoSource, buildMongoConfig } from '@alien-worlds/api-core';
import cron from 'cron';
import { buildCronConfig, buildLeaderboardServiceConfig } from '../config';
import { updateLeaderboard } from './update-leaderboard';

export const start = async () => {
  const vars = new ConfigVars();
  const mongoConfig = buildMongoConfig(vars);
  const cronConfig = buildCronConfig(vars);
  const leaderboardConfig = buildLeaderboardServiceConfig(vars);

  //
  if (cronConfig.leaderboardUpdateTime) {
    const mongoSource = await MongoSource.create(mongoConfig);
    const leaderboardCronJob = new cron.CronJob(cronConfig.leaderboardUpdateTime, () =>
      updateLeaderboard(leaderboardConfig, mongoSource)
    );

    leaderboardCronJob.start();
  }
};

start();
