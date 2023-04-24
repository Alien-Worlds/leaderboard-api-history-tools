import { NotifyWorldContract } from '@alien-worlds/alienworlds-api-common';
import { log } from '@alien-worlds/api-core';
import {
  ActionTraceProcessorInput,
  ProcessorTaskModel,
} from '@alien-worlds/api-history-tools';
import { LeaderboardActionTraceProcessor } from '../leaderboard-action-trace.processor';
import { LeaderboardUpdateRepository } from '../../leaderboard/domain/repositories/leaderboard-update.repository';
import { LeaderboardUpdate } from '../../leaderboard/domain/entities/leaderboard-update';

type ContractData = { [key: string]: unknown };

export default class NotifyWorldActionProcessor extends LeaderboardActionTraceProcessor<ContractData> {
  public async run(model: ProcessorTaskModel): Promise<void> {
    try {
      this.input = ActionTraceProcessorInput.create(model);
      const { NotifyWorldActionName } = NotifyWorldContract.Actions;
      const { input, ioc } = this;
      const { blockNumber, blockTimestamp, name, data } = input;

      const leaderboardUpdates = ioc.get<LeaderboardUpdateRepository>(
        LeaderboardUpdateRepository.Token
      );

      if (name === NotifyWorldActionName.Logmine) {
        const update = LeaderboardUpdate.fromLogmineJson(
          blockNumber,
          blockTimestamp,
          <NotifyWorldContract.Actions.Types.LogmineStruct>data
        );

        const { failure } = await leaderboardUpdates.add([update]);
        if (failure) {
          log(failure.error);
        }
        this.reject(failure.error);
      } else {
        this.resolve();
      }
    } catch (error) {
      log(error);
      this.reject(error);
    }
  }
}
