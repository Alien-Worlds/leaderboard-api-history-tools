import { UserRepository } from './../users/user.repository';
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  AtomicAssetRepository,
  FederationContract,
  LeaderboardService,
  LeaderboardUpdateStruct,
  NotifyWorldContract,
  UsptsWorldsContract,
} from '@alien-worlds/alienworlds-api-common';
import { BroadcastClient, MongoSource } from '@alien-worlds/api-core';
import {
  ActionTraceProcessor,
  ActionTraceProcessorInput,
  ProcessorTaskModel,
} from '@alien-worlds/api-history-tools';
import { ExtendedLeaderboardServiceConfig } from '../../config';
import { LeaderboardUpdateBackupRepository } from '../leaderboard/leaderboard-update-backup.repository';
import {
  postLeaderboard,
  buildLeaderboardRequest,
} from '../leaderboard/leaderboard.utils';
import { ProcessorSharedData } from '../processor.types';

export class ExtendedActionTraceProcessor<
  DataType
> extends ActionTraceProcessor<DataType> {
  constructor(
    mongoSource: MongoSource,
    protected broadcast: BroadcastClient,
    protected users: UserRepository
  ) {
    super(mongoSource);
  }

  protected async sendLeaderboard(
    blockNumber: bigint,
    blockTimestamp: Date,
    sharedData: ProcessorSharedData
  ) {
    const { leaderboard, config } = sharedData;
    const { batchSize } = config.leaderboard as ExtendedLeaderboardServiceConfig;

    if (leaderboard.length >= batchSize) {
      const wallets = leaderboard.reduce((list, struct) => {
        if (struct.miner) {
          list.push(struct.miner);
        }
        return list;
      }, []);

      const { content: users } = await this.users.list(wallets);
      const body = buildLeaderboardRequest(
        blockNumber,
        blockTimestamp,
        sharedData,
        users
      );
      postLeaderboard(config.leaderboard, body, (structs: LeaderboardUpdateStruct[]) => {
        const repository = new LeaderboardUpdateBackupRepository(this.mongoSource);
        repository.add(structs);
      });
    }
  }

  public async run(
    data: ProcessorTaskModel,
    sharedData: ProcessorSharedData
  ): Promise<void> {
    this.input = ActionTraceProcessorInput.create<DataType>(data);
  }
}
