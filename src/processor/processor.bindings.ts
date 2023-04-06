import { WorkerContainer } from '@alien-worlds/api-history-tools';
import { ProcessorLabel } from './processor.labels';
import UsptsWorldsActionProcessor from './processors/uspts-worlds/uspts-worlds.action-processor';
import FederationDeltaProcessor from './processors/federation/federation.delta-processor';
import NotifyWorldActionProcessor from './processors/notify-world/notify-world.action-processor';

const container = new WorkerContainer();

// 'uspts.worlds'
container.bind(ProcessorLabel.UsptsWorldsActionProcessor, UsptsWorldsActionProcessor);
// 'federation'
container.bind(ProcessorLabel.FederationDeltaProcessor, FederationDeltaProcessor);
// 'notify.world'
container.bind(ProcessorLabel.NotifyWorldActionProcessor, NotifyWorldActionProcessor);

export default container;
