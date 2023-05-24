/* eslint-disable @typescript-eslint/no-unused-vars */
import { Broadcast, BroadcastConfig, log } from '@alien-worlds/api-core';
import {
  InternalBroadcastChannel,
  InternalBroadcastClientName,
} from '@alien-worlds/api-history-tools';

export const startExternalBroadcast = async (
  externalBroadcastConfig: BroadcastConfig,
  internalBroadcastConfig: BroadcastConfig
) => {
  log(`External broadcast ... [starting]`);
  // start tcp socket server so that interested listeners like the leaderboard api
  // could receive messages with data from the blockchain
  const server = await Broadcast.startServer(externalBroadcastConfig);

  // listen to internal messages to channel "external-broadcast"
  const broadcast = await Broadcast.createClient({
    ...internalBroadcastConfig,
    clientName: InternalBroadcastClientName.ExternalBroadcast,
  });

  broadcast.onMessage(InternalBroadcastChannel.ExternalBroadcast, async message => {
    //
  });

  broadcast.connect();

  log(`External broadcast ... [ready]`);
};
