import { Container } from '@alien-worlds/api-core';
import { ActionTraceProcessor } from '@alien-worlds/api-history-tools';
import { ProcessorSharedData } from '../processor.types';

export class LeaderboardActionTraceProcessor<DataType> extends ActionTraceProcessor<
  DataType,
  ProcessorSharedData
> {
  protected ioc: Container;

  constructor(components: {
    ioc: Container;
    sharedData: ProcessorSharedData;
  }) {
    super();
    const { ioc, sharedData } = components;
    this.sharedData = sharedData;
    this.ioc = ioc;
  }
}
