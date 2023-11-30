/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  AtomicAssetRepository,
  AtomicAsset,
} from '@alien-worlds/aw-api-common-atomicassets';
import {
  LeaderboardUpdateRepository,
  UpdateLeaderboardUseCase,
  MinigToolData,
} from '@alien-worlds/aw-api-common-leaderboard';
import { Container, log, Worker } from '@alien-worlds/aw-history-starter-kit';
import { LeaderboardSharedData } from './leaderboard.types';

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
      const atomicAssetsRepository = ioc.get<AtomicAssetRepository>(
        AtomicAssetRepository.Token
      );
      const fastline = [];
      const slowline = [];
      const failedUpdates = [];
      const ids: bigint[] = [];
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
          loop = false;
          if (totalUpdates === 0) {
            log(`Worker: ${this.id} [update-leaderboard] no updates...`);
            this.resolve();
            return;
          }
        }
      }

      log(
        `Worker: ${this.id} [update-leaderboard] Selected ${totalUpdates} updates, ${
          slowline.length > 0 ? slowline.length : 'none'
        } of which require atomic assets. Total: ${ids.length} assets`
      );

      if (fastline.length > 0) {
        log(
          `Worker: ${this.id} [update-leaderboard] Starting the fastline update (${fastline.length})...`
        );
        const fastlineUpdate = await updateLeaderboardUseCase.execute(fastline);

        if (fastlineUpdate.failure?.error.failedUpdates.length > 0) {
          log(
            `Worker: ${this.id} [update-leaderboard] fastline update failure.`,
            fastlineUpdate.failure.error.message
          );
          failedUpdates.push(...fastlineUpdate.failure.error.failedUpdates);
        }
      }

      if (slowline.length > 0) {
        log(
          `Worker: ${this.id} [update-leaderboard] Getting ${ids.length} atomic assets ...`
        );
        const assets: AtomicAsset[] = [];
        const { content, failure: getAssetsFailure } =
          await atomicAssetsRepository.getAssets(ids, false);

        if (
          (getAssetsFailure && getAssetsFailure.error.assets.length === 0) ||
          content?.length === 0
        ) {
          log(
            `Worker: ${this.id} [update-leaderboard] None of the atomic assets have been downloaded ...`
          );
          failedUpdates.push(...slowline);
        } else {
          if (getAssetsFailure && getAssetsFailure.error.assets.length > 0) {
            log(
              `Worker: ${this.id} [update-leaderboard] Some atomic assets have been downloaded, proceeding to update ...`
            );
            assets.push(...getAssetsFailure.error.assets);
          } else {
            assets.push(...content);
          }

          const slowlineUpdate = await updateLeaderboardUseCase.execute(
            slowline,
            assets as AtomicAsset<MinigToolData>[]
          );

          if (slowlineUpdate.failure?.error.failedUpdates.length > 0) {
            log(
              `Worker: ${this.id} [update-leaderboard] slowline update failure.`,
              slowlineUpdate.failure.error.message
            );
            failedUpdates.push(...slowlineUpdate.failure.error.failedUpdates);
          }
        }
      }

      if (failedUpdates.length > 0) {
        log(
          `Worker: ${this.id} [update-leaderboard] ${failedUpdates.length} updates out of ${totalUpdates} failed. They will be added to the queue for the next attempt.`
        );
        await updatesRepository.add(failedUpdates);
      } else {
        log(`Worker: ${this.id} [update-leaderboard] Update complete ...`);
      }

      this.resolve();
    } catch (error) {
      log(error);
      this.reject(error);
    }
  }
}
