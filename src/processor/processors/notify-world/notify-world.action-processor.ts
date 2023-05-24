import {
  AtomicAssetRepository,
  LeaderboardUpdate,
  LeaderboardUpdateRepository,
  NotifyWorldContract,
} from '@alien-worlds/alienworlds-api-common';
import { log, parseToBigInt } from '@alien-worlds/api-core';
import {
  ActionTraceProcessorInput,
  ProcessorTaskModel,
} from '@alien-worlds/api-history-tools';
import { LeaderboardActionTraceProcessor } from '../leaderboard-action-trace.processor';

type ContractData = { [key: string]: unknown };

export default class NotifyWorldActionProcessor extends LeaderboardActionTraceProcessor<ContractData> {
  public async run(model: ProcessorTaskModel): Promise<void> {
    try {
      this.input = ActionTraceProcessorInput.create(model);
      const { NotifyWorldActionName } = NotifyWorldContract.Actions;
      const { input, ioc, sharedData } = this;
      const {
        config: {
          atomicassets: {
            api: { maxAssetsPerRequest },
          },
          leaderboard: { tlmDecimalPrecision, updateBatchSize },
        },
      } = sharedData;
      const { blockNumber, blockTimestamp, name, data } = input;

      const leaderboardUpdates = ioc.get<LeaderboardUpdateRepository>(
        LeaderboardUpdateRepository.Token
      );
      const atomicAssetsRepository = ioc.get<AtomicAssetRepository>(
        AtomicAssetRepository.Token
      );

      if (name === NotifyWorldActionName.Logmine) {
        const update = LeaderboardUpdate.fromLogmineJson(
          blockNumber,
          blockTimestamp,
          <NotifyWorldContract.Actions.Types.LogmineStruct>data,
          tlmDecimalPrecision
        );

        const json = update.toJson();

        sharedData.updates.push(json);

        if (json.bag_items?.length > 0) {
          sharedData.assets.push(...json.bag_items.map(item => parseToBigInt(item)));
        }

        if (sharedData.assets.length >= maxAssetsPerRequest) {
          const assets = sharedData.assets.splice(0, maxAssetsPerRequest);
          log(`notify.world:logmine action: Fetching ${assets.length} assets...`);

          const { failure: getAssetsFailure } = await atomicAssetsRepository.getAssets(
            assets,
            true
          );

          if (getAssetsFailure) {
            const {
              error: { failedFetch },
            } = getAssetsFailure;
            log(`Failed to fetch assets.`, getAssetsFailure.error);
            sharedData.assets.push(...failedFetch);
          }
        }

        if (sharedData.updates.length >= updateBatchSize) {
          const updates = sharedData.updates.splice(0, updateBatchSize);
          sharedData.updates = [];
          const updateResult = await leaderboardUpdates.add(
            updates.map(json => LeaderboardUpdate.fromJson(json))
          );

          if (updateResult.isFailure) {
            sharedData.updates.push(...updates);
          }
        }
      }
      this.resolve();
    } catch (error) {
      log(`notify.world action processor failure.`);
      this.reject(error);
    }
  }
}
