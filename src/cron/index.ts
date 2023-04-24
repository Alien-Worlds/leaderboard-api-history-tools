import { ConfigVars, Container, MongoSource, buildMongoConfig } from '@alien-worlds/api-core';
import cron from 'cron';
import { buildAtomicAssetsConfig, buildCronConfig, buildLeaderboardServiceConfig } from '../config';
import { updateLeaderboard } from './update-leaderboard';

export const start = async () => {
  const vars = new ConfigVars();
  const mongoConfig = buildMongoConfig(vars);
  const cronConfig = buildCronConfig(vars);
  const atomicAssetsConfig = buildAtomicAssetsConfig(vars);
  const leaderboardConfig = buildLeaderboardServiceConfig(vars);
  const ioc = new Container();
  //
  if (cronConfig.leaderboardUpdateTime) {
    const mongoSource = await MongoSource.create(mongoConfig);
    const leaderboardCronJob = new cron.CronJob(cronConfig.leaderboardUpdateTime, () =>
      updateLeaderboard(ioc, cronConfig, atomicAssetsConfig)
    );

    leaderboardCronJob.start();
  }
};

start();
