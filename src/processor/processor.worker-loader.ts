import { Container, MongoSource } from '@alien-worlds/api-core';
import {
  DefaultWorkerLoader,
  Worker,
  WorkerContainer,
} from '@alien-worlds/api-history-tools';
import { ProcessorSharedData } from './processor.types';
import { ProcessorLabel } from './processor.labels';
import NotifyWorldActionProcessor from './processors/notify-world/notify-world.action-processor';
import UsptsWorldsActionProcessor from './processors/uspts-worlds/uspts-worlds.action-processor';
import FederationActionProcessor from './processors/federation/federation-world.action-processor';
import {
  LeaderboardUpdateMongoSource,
  LeaderboardUpdateRepository,
  LeaderboardUpdateRepositoryImpl,
  setupLeaderboard,
} from '@alien-worlds/leaderboard-api-common';
import { setupAtomicAssets } from '@alien-worlds/atomicassets-api-common';

export default class ProcessorWorkerLoader extends DefaultWorkerLoader {
  private container = new WorkerContainer();
  private ioc: Container;

  public async setup(sharedData: ProcessorSharedData): Promise<void> {
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

    // 'uspts.worlds'
    this.container.bind(
      ProcessorLabel.UsptsWorldsActionProcessor,
      UsptsWorldsActionProcessor
    );
    // 'federation'
    this.container.bind(
      ProcessorLabel.FederationActionProcessor,
      FederationActionProcessor
    );
    // 'notify.world'
    this.container.bind(
      ProcessorLabel.NotifyWorldActionProcessor,
      NotifyWorldActionProcessor
    );
  }

  public async load(pointer: string) {
    const { ioc, sharedData } = this;
    const Class = this.container.get(pointer);
    const worker: Worker = new Class({
      ioc,
      sharedData,
    }) as Worker;
    return worker;
  }
}
