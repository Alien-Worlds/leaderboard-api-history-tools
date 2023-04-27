import { NotifyWorldContract } from '@alien-worlds/alienworlds-api-common';
import { log, parseToBigInt } from '@alien-worlds/api-core';
import {
  ActionTraceProcessorInput,
  ProcessorTaskModel,
} from '@alien-worlds/api-history-tools';
import { LeaderboardActionTraceProcessor } from '../leaderboard-action-trace.processor';
import { LeaderboardUpdateRepository } from '../../leaderboard/domain/repositories/leaderboard-update.repository';
import { LeaderboardUpdate } from '../../leaderboard/domain/entities/leaderboard-update';
import { AtomicAssetsService } from '../../atomic-assets/domain/services/atomic-assets.service';

type ContractData = { [key: string]: unknown };

export default class NotifyWorldActionProcessor extends LeaderboardActionTraceProcessor<ContractData> {
  public async run(model: ProcessorTaskModel): Promise<void> {
    try {
      this.input = ActionTraceProcessorInput.create(model);
      const { NotifyWorldActionName } = NotifyWorldContract.Actions;
      const { input, ioc, sharedData } = this;
      const {
        config: {
          atomicassets: { api: atomicAssetsApiConfig },
        },
      } = sharedData;
      const { blockNumber, blockTimestamp, name, data } = input;

      const leaderboardUpdates = ioc.get<LeaderboardUpdateRepository>(
        LeaderboardUpdateRepository.Token
      );
      const atomicAssets = ioc.get<AtomicAssetsService>(AtomicAssetsService.Token);

      if (name === NotifyWorldActionName.Logmine) {
        const update = LeaderboardUpdate.fromLogmineJson(
          blockNumber,
          blockTimestamp,
          <NotifyWorldContract.Actions.Types.LogmineStruct>data
        );

        const json = update.toJson();

        sharedData.updates.push(json);
        if (json.bag_items?.length > 0) {
          sharedData.assets.push(...json.bag_items.map(item => parseToBigInt(item)));
        }

        if (
          sharedData.assets.length >= atomicAssetsApiConfig.maxAssetsPerRequest &&
          atomicAssets.isAvailable()
        ) {
          log(`notify.world:logmine action: Fetching ${sharedData.assets.length} assets...`);
          atomicAssets.getAssets(sharedData.assets).then(({ failure }) => {
            if (failure) {
              log(failure.error.message);
              sharedData.assets.unshift(...failure.error.failedFetch);
            }
          });
          sharedData.assets = [];
        }

        if (sharedData.updates.length >= 1000) {
          const updates = sharedData.updates.map(json =>
            LeaderboardUpdate.fromJson(json)
          );
          leaderboardUpdates.add(updates);
          sharedData.updates = [];
        }
      }
      this.resolve();
    } catch (error) {
      log(error);
      this.reject(error);
    }
  }
}
