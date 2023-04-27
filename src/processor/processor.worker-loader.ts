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
import { setupLeaderboard } from './leaderboard/ioc.config';
import { setupAtomicAssets } from './atomic-assets/ioc.config';

export default class ProcessorWorkerLoader extends DefaultWorkerLoader {
  private container = new WorkerContainer();
  private ioc: Container;
  private maxAssetsPerRequest: number;

  public async setup(sharedData: ProcessorSharedData): Promise<void> {
    super.setup(sharedData);
    const {
      config: { mongo, leaderboard, atomicassets },
    } = sharedData;
    this.ioc = new Container();
    const mongoSource = await MongoSource.create(mongo);
    await setupAtomicAssets(atomicassets, mongoSource, this.ioc);
    await setupLeaderboard(leaderboard, mongoSource, this.ioc);
    this.maxAssetsPerRequest = atomicassets.api.maxAssetsPerRequest;
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
    const { ioc, sharedData, maxAssetsPerRequest } = this;
    const Class = this.container.get(pointer);
    const worker: Worker = new Class({
      ioc,
      sharedData,
      maxAssetsPerRequest,
    }) as Worker;
    return worker;
  }
}
