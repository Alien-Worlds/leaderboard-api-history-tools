import { Container, Result, UpdateStatus, log } from '@alien-worlds/api-core';
import { LeaderboardUpdateRepository } from '../processor/leaderboard/domain/repositories/leaderboard-update.repository';
import { UpdateLeaderboardUseCase } from '../processor/leaderboard/domain/use-cases/update-leaderboard.use-case';
import { GetAtomicAssetsUseCase } from '../processor/atomic-assets/domain/use-cases/get-atomic-assets.use-case';
import { AtomicAsset, AtomicAssetsConfig } from '@alien-worlds/alienworlds-api-common';
import { MinigToolData } from '../processor/leaderboard/data/leaderboard.dtos';
import { LeaderboardUpdate } from '../processor/leaderboard/domain/entities/leaderboard-update';
import { LeaderboardUpdateError } from '../processor/leaderboard/domain/errors/leaderboard-update.error';
import { CronConfig } from '../config';

let busy = false;

export const updateLeaderboard = async (
  ioc: Container,
  cronConfig: CronConfig,
  atomicAssetsConfig: AtomicAssetsConfig
) => {
  log(`[CRON] Checking for unsent leaderboard updates...`);
  if (busy) {
    return;
  }
  // hold
  busy = true;

  const updatesRepository = ioc.get<LeaderboardUpdateRepository>(
    LeaderboardUpdateRepository.Token
  );
  const updateLeaderboardUseCase = ioc.get<UpdateLeaderboardUseCase>(
    UpdateLeaderboardUseCase.Token
  );
  const getAtomicAssetsUseCase = ioc.get<GetAtomicAssetsUseCase>(
    GetAtomicAssetsUseCase.Token
  );
  const updatesBatchSize = cronConfig.leaderboardUpdateBatchSize || 10;
  const maxAssetsPerRequest = atomicAssetsConfig.api.maxAssetsPerRequest || 10;
  // queue of updates without assets
  const fastline: LeaderboardUpdate[] = [];
  // queue of updates with assets
  const regular: LeaderboardUpdate[] = [];
  const ids: bigint[] = [];
  const assets: AtomicAsset<MinigToolData>[] = [];
  let updateResult: Result<
    UpdateStatus.Success | UpdateStatus.Failure,
    LeaderboardUpdateError
  >;
  let loop = true;

  while (loop) {
    const { content } = await updatesRepository.next();

    if (content) {
      if (Array.isArray(content.bagItems)) {
        ids.push(...content.bagItems);
        regular.push(content);
      } else {
        fastline.push(content);
      }

      loop = regular.length + fastline.length < updatesBatchSize;
    } else {
      // nothing to update
      return;
    }
  }

  if (ids.length > 0) {
    const { content, failure } = await getAtomicAssetsUseCase.execute(
      ids,
      maxAssetsPerRequest
    );

    if (failure) {
      log(failure.error.message);

      // some assets have been downloaded
      if (failure.error.assets.length > 0) {
        assets.push(...failure.error.assets);
      }
    } else {
      assets.push(...content);
    }
  }

  if (assets.length > 0) {
    // assets downloaded, perform all updates
    updateResult = await updateLeaderboardUseCase.execute(
      [...fastline, ...regular],
      assets
    );
  } else if (assets.length === 0 && fastline.length > 0) {
    // no assets have been downloaded, but there are also updates on the list that do not need them,
    // these should be done
    updateResult = await updateLeaderboardUseCase.execute(fastline, assets);
  } else {
    // no assets downloaded
    // no updates without assets
    await updatesRepository.add([...fastline, ...regular]);

    return;
  }

  if (updateResult.isFailure) {
    const {
      failure: { error },
    } = updateResult;
    log(error.message);
    if (error.failedUpdates.length > 0) {
      await updatesRepository.add(error.failedUpdates);
    }
  }
  // release
  busy = false;
};
