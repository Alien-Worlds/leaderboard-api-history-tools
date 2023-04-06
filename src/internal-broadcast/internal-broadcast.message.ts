import { LeaderboardUpdateMessage } from '@alien-worlds/alienworlds-api-common';
import { SettagStruct } from '@alien-worlds/alienworlds-api-common/build/contracts/federation/actions/data/dtos';
import { LogmineStruct } from '@alien-worlds/alienworlds-api-common/build/contracts/notify-world/actions/data/dtos';
import { AddpointsStruct } from '@alien-worlds/alienworlds-api-common/build/contracts/uspts-worlds/actions/data/dtos';
import { InternalBroadcastChannel } from '@alien-worlds/api-history-tools';
import { AlienWorldsBroadcastMessageName } from './internal-broadcast.enums';

export class LeaderboardUpdateBroadcastMessage {
  public static create(
    blockNumber: string | bigint,
    blockTimestamp: Date | string,
    settag?: SettagStruct,
    logmine?: LogmineStruct,
    addpoints?: AddpointsStruct
  ) {
    return LeaderboardUpdateMessage.create(
      blockNumber,
      blockTimestamp,
      settag,
      logmine,
      addpoints,
      InternalBroadcastChannel.ExternalBroadcast,
      AlienWorldsBroadcastMessageName.LeaderboardUpdate
    );
  }
}
