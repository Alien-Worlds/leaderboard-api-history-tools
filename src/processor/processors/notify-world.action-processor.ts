import { AssetRawModel } from './../../../node_modules/@alien-worlds/aw-antelope/build/types/data/dtos/asset.dto.d';
import * as NotifyWorldContract from '@alien-worlds/aw-contract-notify-world';
import {
  AtomicAssetMapper,
  AtomicAssetRepositoryImpl,
  AtomicAssetsApiSource,
  AtomicAssetsConfig,
  AtomicAssetsMongoSource,
  buildAtomicAssetsApiUrl,
} from '@alien-worlds/aw-api-common-atomicassets';
import {
  LeaderboardUpdate,
  LeaderboardUpdateJson,
  LeaderboardConfig,
  LeaderboardUpdateRepositoryImpl,
  LeaderboardUpdateMongoSource,
} from '@alien-worlds/aw-api-common-leaderboard';
import {
  parseToBigInt,
  log,
  ActionTraceProcessor,
  ProcessorSharedData,
  ActionTraceProcessorModel,
  ProcessorConfig,
  MongoSource,
} from '@alien-worlds/aw-history-starter-kit';

type ContractData = { [key: string]: unknown };

type LeaderboardProcessorSharedData = ProcessorSharedData & {
  config: {
    workers: {
      sharedData: {
        config: ProcessorConfig & {
          atomicassets: AtomicAssetsConfig;
          leaderboard: LeaderboardConfig;
        };
        updates: LeaderboardUpdateJson[];
        assets: bigint[];
      };
    };
  };
};

const mapper = (
  entity: NotifyWorldContract.Actions.Entities.Logmine
): NotifyWorldContract.Actions.Types.LogmineRawModel => {
  const {
    miner,
    params,
    bounty,
    landId: land_id,
    planetName: planet_name,
    landowner,
    bagItems: bag_items,
    offset,
    landownerShare,
    poolAmounts,
  } = entity;

  return {
    miner,
    land_id,
    planet_name,
    bag_items,
    offset,
    landowner,
    bounty: `${bounty.value} ${bounty.symbol}`,
    params: params.toJSON(),
    pool_amounts: poolAmounts,
    landowner_share: `${landownerShare.value} ${landownerShare.symbol}`,
  };
};

export class NotifyWorldActionProcessor extends ActionTraceProcessor<
  ContractData,
  LeaderboardProcessorSharedData
> {
  public async run(model: ActionTraceProcessorModel<ContractData>): Promise<void> {
    try {
      const {
        sharedData: {
          config: {
            workers: { sharedData },
          },
        },
        dependencies: { dataSource },
      } = this;
      const {
        config: {
          atomicassets: {
            api: { maxAssetsPerRequest },
          },
          leaderboard: { tlmDecimalPrecision, updateBatchSize },
        },
      } = sharedData;

      const atomicAssetRepository = new AtomicAssetRepositoryImpl(
        new AtomicAssetsApiSource(
          buildAtomicAssetsApiUrl(sharedData.config.atomicassets.api),
          maxAssetsPerRequest || 10
        ),
        new AtomicAssetsMongoSource(dataSource as MongoSource),
        new AtomicAssetMapper()
      );
      const leaderboardUpdates = new LeaderboardUpdateRepositoryImpl(
        new LeaderboardUpdateMongoSource(dataSource as MongoSource)
      );

      const taskModelMapper =
        new NotifyWorldContract.Actions.Mappers.NotifyWorldActionProcessorTaskMapper();
      const contract = taskModelMapper.toEntity(model);

      if (contract.name === NotifyWorldContract.Actions.NotifyWorldActionName.Logmine) {
        //
        const { blockNumber, blockTimestamp, data } = contract;
        const update = LeaderboardUpdate.fromLogmineJson(
          blockNumber,
          blockTimestamp,
          mapper(data),
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

          const { failure: getAssetsFailure } = await atomicAssetRepository.getAssets(
            assets.map(a => a.toString()),
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
