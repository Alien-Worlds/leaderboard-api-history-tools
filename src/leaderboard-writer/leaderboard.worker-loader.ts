import { DefaultWorkerLoader } from '@alien-worlds/aw-history-starter-kit';
import { LeaderboardSharedData } from './leaderboard.types';
import LeaderboardWorker from './leaderboard.worker';
import LeaderboardWorkerLoaderDependencies from './leaderboard.worker-loader.dependencies';

export default class LeaderboardWorkerLoader extends DefaultWorkerLoader<
  LeaderboardSharedData,
  LeaderboardWorkerLoaderDependencies
> {
  public async setup(sharedData: LeaderboardSharedData): Promise<void> {
    const { config } = sharedData;
    await super.setup(sharedData, config);
  }

  public async load() {
    const {
      dependencies: { ioc },
      sharedData,
    } = this;

    return new LeaderboardWorker({ ioc, sharedData });
  }
}
