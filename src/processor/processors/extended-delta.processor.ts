/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserRepository } from '../users/user.repository';
import { BroadcastClient, MongoSource } from '@alien-worlds/api-core';
import {
  DeltaProcessor,
  DeltaProcessorInput,
  ProcessorTaskModel,
} from '@alien-worlds/api-history-tools';
import { ProcessorSharedData } from '../processor.types';

export class ExtendedDeltaProcessor<DataType> extends DeltaProcessor<
  DataType,
  ProcessorSharedData
> {
  constructor(
    mongoSource: MongoSource,
    protected broadcast: BroadcastClient,
    protected users: UserRepository
  ) {
    super({ mongoSource });
  }

  public async run(data: ProcessorTaskModel): Promise<void> {
    this.input = DeltaProcessorInput.create<DataType>(data);
  }
}
