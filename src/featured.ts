import { ProcessorLabel } from './processor/processor.labels';

export default {
  traces: [
    {
      shipTraceMessageName: ['transaction_trace_v0'],
      shipActionTraceMessageName: ['action_trace_v0', 'action_trace_v1'],
      contract: ['notify.world'],
      action: ['logmine'],
      processor: ProcessorLabel.NotifyWorldActionProcessor,
    },
  ],
  deltas: [],
};
