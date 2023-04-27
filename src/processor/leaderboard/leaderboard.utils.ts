import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import ms from 'ms';

import {
  buildLeaderboardApiUrl,
  FederationContract,
  NotifyWorldContract,
  UsptsWorldsContract,
} from '@alien-worlds/alienworlds-api-common';
import { log } from '@alien-worlds/api-core';
import { ProcessorSharedData } from '../processor.types';
import { ExtendedLeaderboardConfig } from '../../config';
import { User } from '../users/user';

type LeaderboardUpdateStruct = {
  wallet_id: string;
  username?: string;
  bounty?: string | number;
  block_number?: string;
  block_timestamp?: string;
  points?: number | string;
  land_id?: string;
  planet_name?: string;
  bag_items?: string[];
  [key: string]: unknown;
};

type PostFailureCallback = (structs: LeaderboardUpdateStruct[]) => void;

export const generateLeaderboardUpdateToken = (
  config: ExtendedLeaderboardConfig
) => {
  if (!config.secretKey) {
    return null;
  }

  const decodedToken = jwt.decode(config.token, { json: true });

  if (decodedToken && decodedToken.exp * 1000 - Date.now() > ms(config.expirationTime)) {
    return decodedToken;
  }

  const token = jwt.sign({ service: 'LEADERBOARD_API' }, config.secretKey, {
    expiresIn: config.expirationTime,
  });

  config.token = token;

  return token;
};

export const postLeaderboard = async (
  config: ExtendedLeaderboardConfig,
  body: LeaderboardUpdateStruct[],
  onFailure: PostFailureCallback
): Promise<boolean> => {
  try {
    const url = buildLeaderboardApiUrl(config.api);
    const token = generateLeaderboardUpdateToken(config);

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    log(`Leaderboard Service: Sending ${body.length} structs...`);
    const response = await fetch(new URL('/v1/leaderboard', url), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (response.ok) {
      log(`Leaderboard Service: Sent.`);
      return true;
    }
  } catch (error) {
    log(error);
    if (onFailure) {
      onFailure(body);
    }
    return false;
  }
};

export const buildLeaderboardRequest = (
  blockNumber: bigint,
  blockTimestamp: Date,
  sharedData: ProcessorSharedData,
  users: User[]
): LeaderboardUpdateStruct[] => {
  const { updates } = sharedData;
  const structs: (
    | NotifyWorldContract.Actions.Types.LogmineStruct
    | UsptsWorldsContract.Actions.Types.AddpointsStruct
    | FederationContract.Actions.Types.SettagStruct
  )[] = updates.splice(0);

  return structs.map(struct => {
    if (struct.user && struct.points) {
      const data = <UsptsWorldsContract.Actions.Types.AddpointsStruct>struct;
      const user = users.find(value => value.walletId === data.user);
      const body = {
        wallet_id: data.user,
        points: data.points,
        block_number: blockNumber.toString(),
        block_timestamp: blockTimestamp.toISOString(),
      };

      if (user?.username) {
        body['username'] = user?.username;
      }

      return body;
    }

    const data = <NotifyWorldContract.Actions.Types.LogmineStruct>struct;
    const user = users.find(value => value.walletId === data.miner);

    const body = {
      wallet_id: data.miner,
      bounty: data.bounty,
      land_id: data.land_id,
      planet_name: data.planet_name,
      bag_items: data.bag_items,
      block_number: blockNumber.toString(),
      block_timestamp: blockTimestamp.toISOString(),
    };

    if (user?.username) {
      body['username'] = user?.username;
    }

    return body;
  });
};
