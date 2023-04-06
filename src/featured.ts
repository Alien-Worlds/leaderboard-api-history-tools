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
  ],
  deltas: [
    {
      shipDeltaMessageName: ['table_delta_v0'],
      name: ['contract_row'],
      code: ['federation'],
      scope: ['*'],
      table: ['players'],
      processor: ProcessorLabel.FederationDeltaProcessor,
    },
  ],
};
