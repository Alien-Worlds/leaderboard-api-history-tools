import { WorkerContainer } from '@alien-worlds/api-history-tools';
import { ProcessorLabel } from './processor.labels';
import NotifyWorldActionProcessor from './processors/notify-world/notify-world.action-processor';

const container = new WorkerContainer();

// 'notify.world'
container.bind(ProcessorLabel.NotifyWorldActionProcessor, NotifyWorldActionProcessor);

export default container;
