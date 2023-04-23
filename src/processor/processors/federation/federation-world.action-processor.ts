import {
  FederationContract,
  NotifyWorldContract,
} from '@alien-worlds/alienworlds-api-common';
import {
  ContractAction,
  ContractUnkownDataEntity,
  DataSourceOperationError,
  log,
} from '@alien-worlds/api-core';
import {
  ActionTraceProcessorInput,
  ProcessorTaskModel,
} from '@alien-worlds/api-history-tools';
import { LeaderboardActionTraceProcessor } from '../leaderboard-action-trace.processor';
import { UpdateLeaderboardUseCase } from '../../leaderboard/domain/use-cases/update-leaderboard.use-case';
import { LeaderboardUpdate } from '../../leaderboard/domain/entities/leaderboard-update';
import { LeaderboardUpdateRepository } from '../../leaderboard/domain/repositories/leaderboard-update.repository';

type ContractData = { [key: string]: unknown };

export default class FederationActionProcessor extends LeaderboardActionTraceProcessor<ContractData> {
  public async run(model: ProcessorTaskModel): Promise<void> {
    try {
      this.input = ActionTraceProcessorInput.create(model);
      const { FederationActionName } = FederationContract.Actions;
      const { input, ioc } = this;
      const { blockNumber, blockTimestamp, name, data } = input;

      const updateLeaderboardUseCse = ioc.get<UpdateLeaderboardUseCase>(
        UpdateLeaderboardUseCase.Token
      );
      const leaderboardUpdates = ioc.get<LeaderboardUpdateRepository>(
        LeaderboardUpdateRepository.Token
      );

      if (name === FederationActionName.Settag) {
        const update = LeaderboardUpdate.fromSetTagJson(
          blockNumber,
          blockTimestamp,
          <FederationContract.Actions.Types.SettagDocument>data
        );
        const { failure: updateFailure } = await updateLeaderboardUseCse.execute([
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
