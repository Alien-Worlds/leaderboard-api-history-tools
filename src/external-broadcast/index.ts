import { log } from '@alien-worlds/api-core';
import { Command } from 'commander';
import { buildConfig } from '../config/config';
import { startExternalBroadcast } from './start-broadcast';

const program = new Command();

const start = async () => {
  const config = buildConfig();

  startExternalBroadcast(config.externalBroadcast, config.broadcast).catch(log);
};

program.version('1.0', '-v, --version').parse(process.argv);

start().catch(log);
