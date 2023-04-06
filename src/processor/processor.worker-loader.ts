import { UserRepository } from './users/user.repository';
import { Broadcast, BroadcastClient, MongoSource } from '@alien-worlds/api-core';
import { DefaultWorkerLoader } from '@alien-worlds/api-history-tools';
import { AlienWorldsBroadcastClient } from '../internal-broadcast/internal-broadcast.enums';
import { ProcessorSharedData } from './processor.types';

export default class MyProcessorWorkerLoader extends DefaultWorkerLoader {
  private mongoSource: MongoSource;
  private broadcast: BroadcastClient;
  private users: UserRepository;

  public async setup(sharedData: ProcessorSharedData): Promise<void> {
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
  }

  public async load(pointer: string, containerPath: string) {
    const { mongoSource, broadcast, users } = this;
    return super.load(
      pointer,
      containerPath,
      mongoSource,
      broadcast,
      users
    );
  }
}
