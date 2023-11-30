import {
  LeaderboardUpdateMongoSource,
  LeaderboardUpdateRepository,
  LeaderboardUpdateRepositoryImpl,
  setupLeaderboard,
} from '@alien-worlds/aw-api-common-leaderboard';
import { setupAtomicAssets } from '@alien-worlds/aw-api-common-atomicassets';
import { LeaderboardWriterConfig } from './leaderboard.types';
import { Container, MongoSource } from '@alien-worlds/aw-history-starter-kit';

export default class LeaderboardWorkerLoaderDependencies {
  public ioc: Container;

  public async initialize(config: LeaderboardWriterConfig): Promise<void> {
    const { mongo, leaderboard, atomicassets } = config;
    const [mongoSource, leaderboardApiMongoSource] = await Promise.all([
      MongoSource.create(mongo),
      MongoSource.create(leaderboard.mongo),
    ]);
    this.ioc = new Container();

    this.ioc
      .bind<LeaderboardUpdateRepository>(LeaderboardUpdateRepository.Token)
      .toConstantValue(
        new LeaderboardUpdateRepositoryImpl(new LeaderboardUpdateMongoSource(mongoSource))
      );

    await setupAtomicAssets(atomicassets, mongoSource, this.ioc);
    await setupLeaderboard(leaderboard, leaderboardApiMongoSource, this.ioc);
  }
}
