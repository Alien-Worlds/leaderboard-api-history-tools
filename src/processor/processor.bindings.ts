import { WorkerContainer } from '@alien-worlds/api-history-tools';
import { ProcessorLabel } from './processor.labels';
import UsptsWorldsActionProcessor from './processors/uspts-worlds/uspts-worlds.action-processor';
import NotifyWorldActionProcessor from './processors/notify-world/notify-world.action-processor';
import FederationActionProcessor from './processors/federation/federation-world.action-processor';

const container = new WorkerContainer();

// 'uspts.worlds'
container.bind(ProcessorLabel.UsptsWorldsActionProcessor, UsptsWorldsActionProcessor);
// 'federation'
container.bind(ProcessorLabel.FederationActionProcessor, FederationActionProcessor);
// 'notify.world'
container.bind(ProcessorLabel.NotifyWorldActionProcessor, NotifyWorldActionProcessor);

export default container;
