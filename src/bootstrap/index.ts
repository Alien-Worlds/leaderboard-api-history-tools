import { ConfigVars, log } from '@alien-worlds/api-core';
import {
  BootstrapCommandOptions,
  buildBootstrapConfig,
  startBootstrap,
} from '@alien-worlds/api-history-tools';
import { Command } from 'commander';
import featured from '../featured';

const program = new Command();

const start = (options: BootstrapCommandOptions) => {
  const vars = new ConfigVars();
  const config = buildBootstrapConfig(vars, featured, options);
  startBootstrap(config).catch(log);
};

program
  .version('1.0', '-v, --version')
  .option('-k, --scan-key <scan-key>', 'Scan key')
  .option('-s, --start-block <start-block>', 'Start at this block')
  .option('-m, --mode <mode>', 'Mode (default/replay/test)')
  .option('-e, --end-block <end-block>', 'End block (exclusive)')
  .parse(process.argv);

start(program.opts<BootstrapCommandOptions>());
