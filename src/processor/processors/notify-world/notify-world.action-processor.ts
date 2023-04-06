import { NotifyWorldContract } from '@alien-worlds/alienworlds-api-common';
import {
  ContractAction,
  ContractUnkownDataEntity,
  DataSourceOperationError,
  log,
} from '@alien-worlds/api-core';
import { ProcessorTaskModel } from '@alien-worlds/api-history-tools';
import { LeaderboardUpdateBroadcastMessage } from '../../../internal-broadcast/internal-broadcast.message';
import { ProcessorSharedData } from '../../processor.types';
import { ExtendedActionTraceProcessor } from '../extended-action-trace.processor';

type ContractData = { [key: string]: unknown };

export default class NotifyWorldActionProcessor extends ExtendedActionTraceProcessor<ContractData> {
  public async run(
    model: ProcessorTaskModel,
    sharedData: ProcessorSharedData
  ): Promise<void> {
    try {
      await super.run(model, sharedData);
      const { Ioc, NotifyWorldActionName, Entities } = NotifyWorldContract.Actions;
      const { input, mongoSource, broadcast } = this;
      const {
        blockNumber,
        blockTimestamp,
        account,
        name,
        recvSequence,
        globalSequence,
        transactionId,
        data,
      } = input;
      const contractModel = {
        blockNumber,
        blockTimestamp,
        account,
        name,
        receiverSequence: recvSequence,
        globalSequence,
        transactionId,
        data: null,
      };

      const repository = await Ioc.setupNotifyWorldActionRepository(mongoSource);
      if (name === NotifyWorldActionName.Logmine) {
        const logmineStruct = <NotifyWorldContract.Actions.Types.LogmineStruct>data;
        contractModel.data = Entities.LogMine.fromStruct(logmineStruct);
        //
        // broadcast.sendMessage(
        //   LeaderboardUpdateBroadcastMessage.create(
        //     contractModel.blockNumber,
        //     contractModel.blockTimestamp,
        //     null,
        //     logmineStruct
        //   )
        // );
        sharedData.leaderboard.push(logmineStruct);
        this.sendLeaderboard(blockNumber, blockTimestamp, sharedData);
      } else {
        /*
        In the case of an action (test or former etc.) that is not included in the current ABI and 
        for which we do not have defined types, we must save the object in its primary form.
        */
        contractModel.data = ContractUnkownDataEntity.create(data);
      }

      const result = await repository.add(ContractAction.create(contractModel));

      if (result.isFailure) {
        const {
          failure: { error },
        } = result;
        if ((<DataSourceOperationError>error).isDuplicateError) {
          log(`Resolving a task containing duplicate documents: ${error.message}`);
          this.resolve(contractModel);
        } else {
          log(error);
          this.reject(error);
        }
      } else {
        this.resolve(result.content);
      }
    } catch (error) {
      log(error);
      this.reject(error);
    }
  }
}
