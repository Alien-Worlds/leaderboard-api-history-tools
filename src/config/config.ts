import { MongoConfig, parseToBigInt, BroadcastConfig } from '@alien-worlds/api-core';
import { FeaturedConfig } from '@alien-worlds/api-history-tools/build/common/featured';
import featuredConfig from '../featured';
import { readEnvFile } from './config.utils';
import {
  AlienworldsHistoryToolsConfig,
  Environment,
  ExtendedLeaderboardServiceConfig,
  CronConfig,
} from './config.types';
import { AtomicAssetsConfig } from '@alien-worlds/alienworlds-api-common';

export const buildConfig = (): AlienworldsHistoryToolsConfig => {
  const environment: Environment = { ...process.env } as Environment;
  const dotEnv = readEnvFile();

  const mongo: MongoConfig = {
    hosts: (environment.MONGO_HOSTS || dotEnv.MONGO_HOSTS).split(/,\s*/),
    ports: (environment.MONGO_PORTS || dotEnv.MONGO_PORTS).split(/,\s*/),
    database: environment.MONGO_DB_NAME || dotEnv.MONGO_DB_NAME,
    user: environment.MONGO_USER || dotEnv.MONGO_USER,
    password: environment.MONGO_PASSWORD || dotEnv.MONGO_PASSWORD,
    srv: Boolean(Number(environment.MONGO_SRV || dotEnv.MONGO_SRV)),
    ssl: Boolean(Number(environment.MONGO_SSL || dotEnv.MONGO_SSL)),
    replicaSet: environment.MONGO_REPLICA_SET || dotEnv.MONGO_REPLICA_SET,
    authMechanism: environment.MONGO_AUTH_MECHANISM || dotEnv.MONGO_AUTH_MECHANISM,
    authSource: environment.MONGO_AUTH_SOURCE || dotEnv.MONGO_AUTH_SOURCE,
  };

  const leaderboard: ExtendedLeaderboardServiceConfig = {
    api: {
      host: environment.LEADERBOARD_API_HOST || dotEnv.LEADERBOARD_API_HOST,
      port: Number(environment.LEADERBOARD_API_PORT || dotEnv.LEADERBOARD_API_PORT),

      secure: Boolean(
        Number(environment.LEADERBOARD_API_SECURE || dotEnv.LEADERBOARD_API_SECURE)
      ),
    },
    mongo,
    batchSize: Number(
      environment.LEADERBOARD_API_BATCH_SIZE || dotEnv.LEADERBOARD_API_BATCH_SIZE
    ) || 0,
    expirationTime:
      environment.LEADERBOARD_TOKEN_EXPIRATION_TIME ||
      dotEnv.LEADERBOARD_TOKEN_EXPIRATION_TIME ||
      '1h',
    secretKey:
      environment.LEADERBOARD_TOKEN_SECRET_KEY || dotEnv.LEADERBOARD_TOKEN_SECRET_KEY,
    token: environment.LEADERBOARD_TOKEN || dotEnv.LEADERBOARD_TOKEN,
  };

  const atomicassets: AtomicAssetsConfig = {
    api: {
      host: environment.ATOMICASSETS_API_HOST || dotEnv.ATOMICASSETS_API_HOST,
      port: Number(environment.ATOMICASSETS_API_PORT || dotEnv.ATOMICASSETS_API_PORT),
      secure: Boolean(
        Number(environment.ATOMICASSETS_API_SECURE || dotEnv.ATOMICASSETS_API_SECURE)
      ),
    },
    mongo,
  };

  const broadcast: BroadcastConfig = {
    url: environment.BROADCAST_URL || dotEnv.BROADCAST_URL,
    port: Number(environment.BROADCAST_PORT || dotEnv.BROADCAST_PORT),
    host: environment.BROADCAST_HOST || dotEnv.BROADCAST_HOST,
    driver: environment.BROADCAST_DRIVER || dotEnv.BROADCAST_DRIVER,
  };

  const externalBroadcast: BroadcastConfig = {
    port: Number(environment.EXTERNAL_BROADCAST_PORT || dotEnv.EXTERNAL_BROADCAST_PORT),
    host: environment.EXTERNAL_BROADCAST_HOST || dotEnv.EXTERNAL_BROADCAST_HOST,
    driver: environment.EXTERNAL_BROADCAST_DRIVER || dotEnv.EXTERNAL_BROADCAST_DRIVER,
  };

  const cron: CronConfig = {
    leaderboardUpdateTime:
      environment.LEADERBOARD_UPDATE_CRON_TIME || dotEnv.LEADERBOARD_UPDATE_CRON_TIME,
  };

  return {
    broadcast,
    cron,
    externalBroadcast,
    blockchain: {
      endpoint: environment.BLOCKCHAIN_ENDPOINT || dotEnv.BLOCKCHAIN_ENDPOINT,
      chainId: environment.BLOCKCHAIN_CHAIN_ID || dotEnv.BLOCKCHAIN_CHAIN_ID,
    },
    scanner: {
      maxChunkSize: Number(
        environment.SCANNER_NODES_MAX_CHUNK_SIZE || dotEnv.SCANNER_NODES_MAX_CHUNK_SIZE
      ),
      scanKey: environment.SCANNER_SCAN_KEY || dotEnv.SCANNER_SCAN_KEY,
    },
    blockReader: {
      endpoints: (
        environment.BLOCK_READER_ENDPOINTS || dotEnv.BLOCK_READER_ENDPOINTS
      ).split(','),
      shouldFetchDeltas: Boolean(
        Number(environment.BLOCK_READER_FETCH_DELTAS || dotEnv.BLOCK_READER_FETCH_DELTAS)
      ),
      shouldFetchTraces: Boolean(
        Number(environment.BLOCK_READER_FETCH_TRACES || dotEnv.BLOCK_READER_FETCH_TRACES)
      ),
    },
    contractReader: {
      url: environment.HYPERION_URL || dotEnv.HYPERION_URL,
    },
    mongo,
    startBlock:
      environment.START_BLOCK || dotEnv.START_BLOCK
        ? parseToBigInt(environment.START_BLOCK || dotEnv.START_BLOCK)
        : null,
    endBlock:
      environment.END_BLOCK || dotEnv.END_BLOCK
        ? parseToBigInt(environment.END_BLOCK || dotEnv.END_BLOCK)
        : null,
    mode: environment.MODE || dotEnv.MODE,
    startFromHead: Boolean(Number(environment.START_FROM_HEAD || dotEnv.START_FROM_HEAD)),
    featured,
    abis: {
      service: {
        url: environment.HYPERION_URL || dotEnv.HYPERION_URL,
        limit: Number(environment.ABIS_SERVICE_LIMIT || dotEnv.ABIS_SERVICE_LIMIT),
        filter: environment.ABIS_SERVICE_FILTER || dotEnv.ABIS_SERVICE_FILTER,
      },
      mongo,
      featured,
    },
    blockRange: {
      workers: {
        threadsCount: Number(
          environment.BLOCK_RANGE_MAX_THREADS || dotEnv.BLOCK_RANGE_MAX_THREADS
        ),
        inviolableThreadsCount: Number(
          environment.BLOCK_RANGE_INVIOLABLE_THREADS_COUNT ||
            dotEnv.BLOCK_RANGE_INVIOLABLE_THREADS_COUNT
        ),
      },
    },
    processor: {
      workers: {
        threadsCount: Number(
          environment.PROCESSOR_MAX_THREADS || dotEnv.PROCESSOR_MAX_THREADS
        ),
        inviolableThreadsCount: Number(
          environment.PROCESSOR_INVIOLABLE_THREADS_COUNT ||
            dotEnv.PROCESSOR_INVIOLABLE_THREADS_COUNT
        ),
        containerPath: `${__dirname}/../${
          environment.PROCESSOR_BINDINGS_PATH || dotEnv.PROCESSOR_BINDINGS_PATH
        }`,
      },
      taskQueue: {
        interval: 5000,
      },
    },
    api: {
      port: 5000,
    },
    leaderboard,
    atomicassets,
  };
};

const featured = featuredConfig as FeaturedConfig;
