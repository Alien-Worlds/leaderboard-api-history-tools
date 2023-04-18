import { ConfigVars, buildBroadcastConfig, log } from '@alien-worlds/api-core';
import { Command } from 'commander';

const program = new Command();

const start = async () => {
  const vars = new ConfigVars();
  const config = buildBroadcastConfig(vars,'EXTERNAL_');

  // startExternalBroadcast(config.externalBroadcast, config.broadcast).catch(log);
};

program.version('1.0', '-v, --version').parse(process.argv);

start().catch(log);
