import { UserRepository } from './users/user.repository';
import { Broadcast, BroadcastClient, MongoSource } from '@alien-worlds/api-core';
import {
  DefaultWorkerLoader,
  Worker,
  WorkerContainer,
} from '@alien-worlds/api-history-tools';
import { AlienWorldsBroadcastClient } from '../broadcast/internal/internal-broadcast.enums';
import { ProcessorSharedData } from './processor.types';
import { ProcessorLabel } from './processor.labels';
import FederationDeltaProcessor from './processors/federation/federation.delta-processor';
import NotifyWorldActionProcessor from './processors/notify-world/notify-world.action-processor';
import UsptsWorldsActionProcessor from './processors/uspts-worlds/uspts-worlds.action-processor';

export default class MyProcessorWorkerLoader extends DefaultWorkerLoader {
  private mongoSource: MongoSource;
  private broadcast: BroadcastClient;
  private users: UserRepository;
  private container = new WorkerContainer();

  public async setup(sharedData: ProcessorSharedData): Promise<void> {
    super.setup(sharedData);
    const {
      config: { mongo, broadcast },
    } = sharedData;
    this.mongoSource = await MongoSource.create(mongo);
    this.broadcast = await Broadcast.createClient({
      ...broadcast,
      clientName: AlienWorldsBroadcastClient.Processor,
    });
    this.users = new UserRepository(this.mongoSource);

    this.broadcast.connect();

    // 'uspts.worlds'
    this.container.bind(
      ProcessorLabel.UsptsWorldsActionProcessor,
      UsptsWorldsActionProcessor
    );
    // 'federation'
    this.container.bind(
      ProcessorLabel.FederationDeltaProcessor,
      FederationDeltaProcessor
    );
    // 'notify.world'
    this.container.bind(
      ProcessorLabel.NotifyWorldActionProcessor,
      NotifyWorldActionProcessor
    );
  }

  public async load(pointer: string) {
    const { mongoSource, broadcast, users, sharedData } = this;
    const Class = this.container.get(pointer);
    const worker: Worker = new Class({
      mongoSource,
      broadcast,
      users,
      sharedData,
    }) as Worker;
    return worker;
  }
}
