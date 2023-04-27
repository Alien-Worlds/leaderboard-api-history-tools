import { ConfigVars, buildMongoConfig, buildRedisConfig } from '@alien-worlds/api-core';
import { ExtendedLeaderboardConfig, CronConfig } from './config.types';
import { AtomicAssetsConfig } from '@alien-worlds/alienworlds-api-common';

export const buildCronConfig = (vars: ConfigVars): CronConfig => ({
  leaderboardUpdateTime: vars.getStringEnv('LEADERBOARD_UPDATE_CRON_TIME'),
  atomicAssetsDownloadTime: vars.getStringEnv('ATOMIC_ASSETS_DOWNLOAD_CRON_TIME'),
  leaderboardUpdateBatchSize: vars.getNumberEnv('CRON_LEADERBOARD_UPDATE_BATCH_SIZE'),
});

export const buildLeaderboardConfig = (vars: ConfigVars): ExtendedLeaderboardConfig => ({
  api: {
    host: vars.getStringEnv('LEADERBOARD_API_HOST'),
    port: vars.getNumberEnv('LEADERBOARD_API_PORT'),
    secure: vars.getBooleanEnv('LEADERBOARD_API_SECURE'),
  },
  mongo: buildMongoConfig(vars),
  redis: buildRedisConfig(vars),
  batchSize: vars.getNumberEnv('LEADERBOARD_API_BATCH_SIZE') || 0,
  archiveBatchSize: vars.getNumberEnv('LEADERBOARD_ARCHIVE_BATCH_SIZE') || 1000,
  expirationTime: vars.getStringEnv('LEADERBOARD_TOKEN_EXPIRATION_TIME') || '1h',
  secretKey: vars.getStringEnv('LEADERBOARD_TOKEN_SECRET_KEY'),
  token: vars.getStringEnv('LEADERBOARD_TOKEN'),
});

export const buildAtomicAssetsConfig = (vars: ConfigVars): AtomicAssetsConfig => ({
  api: {
    host: vars.getStringEnv('ATOMIC_ASSETS_API_HOST'),
    port: vars.getNumberEnv('ATOMIC_ASSETS_API_PORT'),
    secure: vars.getBooleanEnv('ATOMIC_ASSETS_API_SECURE'),
    maxAssetsPerRequest: vars.getNumberEnv('ATOMIC_ASSETS_API_MAX_ASSETS_PER_REQUEST'),
    maxAssetsRequestPerMinute: vars.getNumberEnv('ATOMIC_ASSETS_MAX_ASSETS_REQUESTS_PER_MINUTE'),
  },
  mongo: buildMongoConfig(vars),
});
