import { Container, MongoSource } from '@alien-worlds/api-core';
import { DefaultWorkerLoader, Worker } from '@alien-worlds/api-history-tools';
import { LeaderboardSharedData } from './leaderboard.types';
import { setupAtomicAssets } from '../processor/atomic-assets/ioc.config';
import { setupLeaderboard } from '../processor/leaderboard/ioc.config';
import LeaderboardWorker from './leaderboard.worker';

export default class LeaderboardWorkerLoader extends DefaultWorkerLoader<LeaderboardSharedData> {
  private ioc: Container;

  public async setup(sharedData: LeaderboardSharedData): Promise<void> {
    super.setup(sharedData);
    const {
      config: { mongo, leaderboard, atomicassets },
    } = sharedData;
    this.ioc = new Container();
    const mongoSource = await MongoSource.create(mongo);
    await setupAtomicAssets(atomicassets, mongoSource, this.ioc);
    await setupLeaderboard(leaderboard, mongoSource, this.ioc);
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
