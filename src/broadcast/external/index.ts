import { ConfigVars, buildBroadcastConfig, log } from '@alien-worlds/api-core';
import { Command } from 'commander';
import { startExternalBroadcast } from './start-broadcast';

const program = new Command();

const start = async () => {
  const vars = new ConfigVars();

  startExternalBroadcast(
    buildBroadcastConfig(vars, 'EXTERNAL_'),
    buildBroadcastConfig(vars)
  ).catch(log);
};

program.version('1.0', '-v, --version').parse(process.argv);

start().catch(log);
