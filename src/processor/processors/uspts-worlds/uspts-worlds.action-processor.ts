import { UsptsWorldsContract } from '@alien-worlds/alienworlds-api-common';
import { log } from '@alien-worlds/api-core';
import {
  ActionTraceProcessorInput,
  ProcessorTaskModel,
} from '@alien-worlds/api-history-tools';
import { LeaderboardActionTraceProcessor } from '../leaderboard-action-trace.processor';
import { LeaderboardUpdateRepository } from '../../leaderboard/domain/repositories/leaderboard-update.repository';
import { UpdateLeaderboardUseCase } from '../../leaderboard/domain/use-cases/update-leaderboard.use-case';
import { LeaderboardUpdate } from '../../leaderboard/domain/entities/leaderboard-update';

type ContractData = { [key: string]: unknown };

export default class UsptsWorldsActionProcessor extends LeaderboardActionTraceProcessor<ContractData> {
  public async run(model: ProcessorTaskModel): Promise<void> {
    try {
      this.input = ActionTraceProcessorInput.create(model);
      const { UsptsWorldsActionName } = UsptsWorldsContract.Actions;
      const { input, ioc } = this;
      const { blockNumber, blockTimestamp, name, data } = input;

      const updateLeaderboardUseCase = ioc.get<UpdateLeaderboardUseCase>(
        UpdateLeaderboardUseCase.Token
      );
      const leaderboardUpdates = ioc.get<LeaderboardUpdateRepository>(
        LeaderboardUpdateRepository.Token
      );

      if (name === UsptsWorldsActionName.AddPoints) {
        const update = LeaderboardUpdate.fromAddPointsJson(
          blockNumber,
          blockTimestamp,
          <UsptsWorldsContract.Actions.Types.AddpointsStruct>data
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
