
import { AtomicAssetsConfig } from '@alien-worlds/aw-api-common-atomicassets';
import { LeaderboardConfig } from '@alien-worlds/aw-api-common-leaderboard';
import { ConfigVars, buildMongoConfig } from '@alien-worlds/aw-history-starter-kit';
import { CronConfig } from './config.types';
import { buildRedisConfig } from '@alien-worlds/aw-storage-redis';


export const buildCronConfig = (vars: ConfigVars): CronConfig => ({
  //
});

export const buildLeaderboardConfig = (vars: ConfigVars): LeaderboardConfig => ({
  mongo: buildMongoConfig(vars, 'LEADERBOARD_API'),
  redis: buildRedisConfig(vars, 'LEADERBOARD_API'),
  tlmDecimalPrecision: vars.getNumberEnv('TLM_DECIMAL_PRECISION') || 4,
  updateBatchSize: vars.getNumberEnv('LEADERBOARD_UPDATE_QUEUE_BATCH_SIZE') || 1000,
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
