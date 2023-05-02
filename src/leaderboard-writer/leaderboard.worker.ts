/* eslint-disable @typescript-eslint/no-unused-vars */
import { Container, log } from '@alien-worlds/api-core';
import { Worker } from '@alien-worlds/api-history-tools';
import { LeaderboardSharedData } from './leaderboard.types';
import {
  AtomicAsset,
  AtomicAssetsService,
  LeaderboardUpdateRepository,
  MinigToolData,
  UpdateLeaderboardUseCase,
} from '@alien-worlds/alienworlds-api-common';

export default class LeaderboardWorker extends Worker<LeaderboardSharedData> {
  protected ioc: Container;

  constructor(components: { ioc: Container; sharedData: LeaderboardSharedData }) {
    super();
    const { ioc, sharedData } = components;
    this.sharedData = sharedData;
    this.ioc = ioc;
  }

  public async run(): Promise<void> {
    const {
      ioc,
      sharedData: {
        config: { updateBatchSize },
      },
    } = this;
    try {
      const updatesRepository = ioc.get<LeaderboardUpdateRepository>(
        LeaderboardUpdateRepository.Token
      );
      const updateLeaderboardUseCase = ioc.get<UpdateLeaderboardUseCase>(
        UpdateLeaderboardUseCase.Token
      );
      const atomicAssetsService = ioc.get<AtomicAssetsService>(AtomicAssetsService.Token);
      const fastline = [];
      const slowline = [];
      const failedUpdates = [];
      const ids: bigint[] = [];
      const assets: AtomicAsset[] = [];
      let loop = true;
      let totalUpdates = 0;

      while (loop) {
        const { content } = await updatesRepository.next();

        if (content) {
          if (Array.isArray(content.bagItems)) {
            ids.push(...content.bagItems);
            slowline.push(content);
          } else {
            fastline.push(content);
          }

          totalUpdates = slowline.length + fastline.length;
          loop = totalUpdates < updateBatchSize;
        } else {
          // nothing to update
          log(`[update-leaderboard] no updates...`);
          return;
        }
      }

      log(
        `[update-leaderboard] Selected ${totalUpdates} updates, ${
          slowline.length > 0 ? slowline.length : 'none'
        } of which require atomic assets.`
      );

      if (fastline.length > 0) {
        log(`[update-leaderboard] Starting the fastline update (${fastline.length})...`);
        const fastlineUpdate = await updateLeaderboardUseCase.execute(fastline);

        if (fastlineUpdate.isFailure) {
          failedUpdates.push(...fastline);
        }
      }

      if (ids.length > 0) {
        log(`[update-leaderboard] Getting atomic assets data ...`);
        const { content, failure } = await atomicAssetsService.getAssets(ids, false);

        if (failure) {
          log(failure.error.message);
          // some assets have been downloaded
          if (failure.error.assets.length > 0) {
            log(
              `[update-leaderboard] Some atomic assets have been downloaded, continuing to update ...`
            );
            assets.push(...failure.error.assets);
          } else {
            log(
              `[update-leaderboard] None of the atomic assets have been downloaded ...`
            );
          }
          log(
            `[update-leaderboard] Updates with missing data will be queued for a later attempt.`
          );
        } else {
          assets.push(...content);
        }
      }

      log(`[update-leaderboard] Starting the update ...`);

      if (assets.length > 0) {
        // assets downloaded, perform all updates
        const slowlineUpdate = await updateLeaderboardUseCase.execute(
          slowline,
          assets as AtomicAsset<MinigToolData>[]
        );

        if (slowlineUpdate.isFailure) {
          failedUpdates.push(...slowline);
        }
      } else {
        log(
          `[update-leaderboard] Operation aborted due to lack of assets or updates ...`
        );
      }

      if (failedUpdates.length > 0) {
        log(
          `[update-leaderboard] ${failedUpdates.length} updates out of ${totalUpdates} failed. They will be added to the queue for the next attempt.`
        );
        await updatesRepository.add(failedUpdates);
      } else {
        log(`[update-leaderboard] Update complete ...`);
      }

      this.resolve();
    } catch (error) {
      this.reject(error);
    }
  }
}
