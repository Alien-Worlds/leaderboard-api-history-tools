import {
  AtomicAssetsConfig,
  NotifyWorldContract,
  UsptsWorldsContract,
  FederationContract,
} from '@alien-worlds/alienworlds-api-common';
import { BroadcastConfig, MongoConfig } from '@alien-worlds/api-core';
import { ExtendedLeaderboardServiceConfig } from '../config';
export type ProcessorOptions = {
  threads: number;
};

export type ProcessorSharedData = {
  config: {
    mongo: MongoConfig;
    leaderboard: ExtendedLeaderboardServiceConfig;
    atomicassets: AtomicAssetsConfig;
    broadcast: BroadcastConfig;
  };
  leaderboard: (
    | NotifyWorldContract.Actions.Types.LogmineStruct
    | UsptsWorldsContract.Actions.Types.AddpointsStruct
    | FederationContract.Actions.Types.SettagStruct
  )[];
};
