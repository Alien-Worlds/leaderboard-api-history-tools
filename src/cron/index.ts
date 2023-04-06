import { MongoSource } from '@alien-worlds/api-core';
import cron from 'cron';
import { buildConfig } from '../config';
import { updateLeaderboard } from './update-leaderboard';

export const start = async () => {
  const config = buildConfig();
  const {
    cron: { leaderboardUpdateTime },
  } = config;
  //
  if (leaderboardUpdateTime) {
    const mongoSource = await MongoSource.create(config.mongo);
    const leaderboardCronJob = new cron.CronJob(leaderboardUpdateTime, () =>
      updateLeaderboard(config.leaderboard, mongoSource)
    );

    leaderboardCronJob.start();
  }
};

start();
