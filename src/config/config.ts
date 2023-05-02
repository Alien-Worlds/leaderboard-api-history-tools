import { ConfigVars, buildMongoConfig, buildRedisConfig } from '@alien-worlds/api-core';
import { CronConfig } from './config.types';
import {
  AtomicAssetsConfig,
  LeaderboardConfig,
} from '@alien-worlds/alienworlds-api-common';

export const buildCronConfig = (vars: ConfigVars): CronConfig => ({
  //
});

export const buildLeaderboardConfig = (vars: ConfigVars): LeaderboardConfig => ({
  mongo: buildMongoConfig(vars, 'LEADERBOARD_API'),
  redis: buildRedisConfig(vars, 'LEADERBOARD_API'),
});

export const buildAtomicAssetsConfig = (vars: ConfigVars): AtomicAssetsConfig => ({
  api: {
    host: vars.getStringEnv('ATOMIC_ASSETS_API_HOST'),
    port: vars.getNumberEnv('ATOMIC_ASSETS_API_PORT'),
    secure: vars.getBooleanEnv('ATOMIC_ASSETS_API_SECURE'),
    maxAssetsPerRequest: vars.getNumberEnv('ATOMIC_ASSETS_API_MAX_ASSETS_PER_REQUEST'),
    maxAssetsRequestsPerMinute: vars.getNumberEnv(
      'ATOMIC_ASSETS_MAX_ASSETS_REQUESTS_PER_MINUTE'
    ),
  },
  mongo: buildMongoConfig(vars),
});
