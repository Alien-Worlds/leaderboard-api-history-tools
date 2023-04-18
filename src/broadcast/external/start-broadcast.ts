import { LeaderboardUpdateMessage } from '@alien-worlds/alienworlds-api-common';
import { Broadcast, BroadcastConfig, log } from '@alien-worlds/api-core';
import {
  InternalBroadcastChannel,
  InternalBroadcastClientName,
} from '@alien-worlds/api-history-tools';
import { ExternalBroadcastChannel } from './external-broadcast.enums';

export const startExternalBroadcast = async (
  externalBroadcastConfig: BroadcastConfig,
  internalBroadcastConfig: BroadcastConfig
) => {
  log(`External broadcast ... [starting]`);
  // // start tcp socket server so that interested listeners like the leaderboard api
  // // could receive messages with data from the blockchain
  // const server = await Broadcast.startServer(externalBroadcastConfig);

  // // listen to internal messages to channel "external-broadcast"
  // const broadcast = await Broadcast.createClient({
  //   ...internalBroadcastConfig,
  //   clientName: InternalBroadcastClientName.ExternalBroadcast,
  // });

  // broadcast.onMessage(InternalBroadcastChannel.ExternalBroadcast, async message => {
  //   // send message with blockchain data (logmine, settag or addpoints)
  //   // to all instances of leaderboard API
  //   // server.sendMessageToChannel(
  //   //   ExternalBroadcastChannel.LeaderboardUpdate,
  //   //   (<LeaderboardUpdateMessage>message.content).data
  //   // );
  // });

  // // run internal listener (client)
  // broadcast.connect();

  // log(`External broadcast ... [ready]`);
  log(`External broadcast ... [skipped]`);
};
