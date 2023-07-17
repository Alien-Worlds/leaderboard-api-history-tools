import { Container, MongoSource } from '@alien-worlds/api-core';
import { DefaultWorkerLoader, Worker } from '@alien-worlds/api-history-tools';
import { LeaderboardSharedData } from './leaderboard.types';
import LeaderboardWorker from './leaderboard.worker';
import { LeaderboardUpdateMongoSource, LeaderboardUpdateRepository, LeaderboardUpdateRepositoryImpl, setupLeaderboard } from '@alien-worlds/leaderboard-api-common';
import { setupAtomicAssets } from '@alien-worlds/atomicassets-api-common';

export default class LeaderboardWorkerLoader extends DefaultWorkerLoader<LeaderboardSharedData> {
  private ioc: Container;

  public async setup(sharedData: LeaderboardSharedData): Promise<void> {
    super.setup(sharedData);
    const {
      config: { mongo, leaderboard, atomicassets },
    } = sharedData;
    this.ioc = new Container();
    const [mongoSource, leaderboardApiMongoSource] = await Promise.all([
      MongoSource.create(mongo),
      MongoSource.create(leaderboard.mongo),
    ]);

    this.ioc
      .bind<LeaderboardUpdateRepository>(LeaderboardUpdateRepository.Token)
      .toConstantValue(
        new LeaderboardUpdateRepositoryImpl(new LeaderboardUpdateMongoSource(mongoSource))
      );

    await setupAtomicAssets(atomicassets, mongoSource, this.ioc);
    await setupLeaderboard(leaderboard, leaderboardApiMongoSource, this.ioc);
  }

  public async load() {
    const { ioc, sharedData } = this;

    const worker = new LeaderboardWorker({
      ioc,
      sharedData,
    }) as Worker;
    return worker;
  }
}
