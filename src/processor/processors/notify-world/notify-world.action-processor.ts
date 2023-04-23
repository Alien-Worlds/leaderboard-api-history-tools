import { NotifyWorldContract } from '@alien-worlds/alienworlds-api-common';
import { log } from '@alien-worlds/api-core';
import {
  ActionTraceProcessorInput,
  ProcessorTaskModel,
} from '@alien-worlds/api-history-tools';
import { LeaderboardActionTraceProcessor } from '../leaderboard-action-trace.processor';
import { UpdateLeaderboardUseCase } from '../../leaderboard/domain/use-cases/update-leaderboard.use-case';
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

      const updateLeaderboardUseCase = ioc.get<UpdateLeaderboardUseCase>(
        UpdateLeaderboardUseCase.Token
      );
      const leaderboardUpdates = ioc.get<LeaderboardUpdateRepository>(
        LeaderboardUpdateRepository.Token
      );

      if (name === NotifyWorldActionName.Logmine) {
        const update = LeaderboardUpdate.fromLogmineJson(
          blockNumber,
          blockTimestamp,
          <NotifyWorldContract.Actions.Types.LogmineStruct>data
        );
        const { failure: updateFailure } = await updateLeaderboardUseCase.execute([
          update,
        ]);

        if (updateFailure) {
          log(updateFailure.error);
          const backupResult = await leaderboardUpdates.add([update]);
          if (backupResult.isFailure) {
            log(backupResult.failure.error);
          }
          this.reject(updateFailure.error);
        } else {
          this.resolve();
        }
      } else {
        this.resolve();
      }
    } catch (error) {
      log(error);
      this.reject(error);
    }
  }
}
