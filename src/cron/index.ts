import {
  ConfigVars,
  Container,
  MongoSource,
  buildMongoConfig,
} from '@alien-worlds/api-core';
import cron from 'cron';
import {
  buildAtomicAssetsConfig,
  buildCronConfig,
  buildLeaderboardConfig,
} from '../config';
import { updateLeaderboard } from './update-leaderboard';
import { setupAtomicAssets } from '../processor/atomic-assets/ioc.config';
import { setupLeaderboard } from '../processor/leaderboard/ioc.config';

export const start = async () => {
  const vars = new ConfigVars();
  const mongoConfig = buildMongoConfig(vars);
  const cronConfig = buildCronConfig(vars);
  const atomicAssetsConfig = buildAtomicAssetsConfig(vars);
  const leaderboardConfig = buildLeaderboardConfig(vars);
  const ioc = new Container();
  const mongoSource = await MongoSource.create(mongoConfig);
  await setupAtomicAssets(atomicAssetsConfig, mongoSource, ioc);
  await setupLeaderboard(leaderboardConfig, mongoSource, ioc);
  //
  if (cronConfig.leaderboardUpdateTime) {
    const leaderboardCronJob = new cron.CronJob(cronConfig.leaderboardUpdateTime, () =>
      updateLeaderboard(ioc, cronConfig, atomicAssetsConfig)
    );

    leaderboardCronJob.start();
  }
};

start();
