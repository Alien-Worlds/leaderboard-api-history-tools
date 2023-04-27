import { ConfigVars, log } from '@alien-worlds/api-core';
import cron from 'cron';
import { buildCronConfig } from '../config';

export const start = async () => {
  log(`Cron jobs:`);
  const vars = new ConfigVars();
  const cronConfig = buildCronConfig(vars);
};

start();
