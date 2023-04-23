import {
  Container,
  MongoSource,
} from '@alien-worlds/api-core';
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

export default class MyProcessorWorkerLoader extends DefaultWorkerLoader {
  private mongoSource: MongoSource;
  private container = new WorkerContainer();
  private ioc: Container;

  public async setup(sharedData: ProcessorSharedData): Promise<void> {
    super.setup(sharedData);
    const {
      config: { mongo },
    } = sharedData;
    this.mongoSource = await MongoSource.create(mongo);
    this.ioc = new Container();
    // await setupLeaderboard(config, ioc);
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
    const { mongoSource, ioc } = this;
    const Class = this.container.get(pointer);
    const worker: Worker = new Class({
      mongoSource,
      ioc,
    }) as Worker;
    return worker;
  }
}
