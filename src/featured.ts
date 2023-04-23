import { ProcessorLabel } from './processor/processor.labels';

export default {
  traces: [
    {
      shipTraceMessageName: ['transaction_trace_v0'],
      shipActionTraceMessageName: ['action_trace_v0', 'action_trace_v1'],
      contract: ['uspts.worlds'],
      action: ['addpoints'],
      processor: ProcessorLabel.UsptsWorldsActionProcessor,
    },
    {
      shipTraceMessageName: ['transaction_trace_v0'],
      shipActionTraceMessageName: ['action_trace_v0', 'action_trace_v1'],
      contract: ['notify.world'],
      action: ['logmine'],
      processor: ProcessorLabel.NotifyWorldActionProcessor,
    },
    {
      shipTraceMessageName: ['transaction_trace_v0'],
      shipActionTraceMessageName: ['action_trace_v0', 'action_trace_v1'],
      contract: ['federation'],
      action: ['settag'],
      processor: ProcessorLabel.FederationActionProcessor,
    },
  ],
  deltas: [],
};
