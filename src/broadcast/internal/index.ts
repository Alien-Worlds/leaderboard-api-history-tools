import { Broadcast, ConfigVars, buildBroadcastConfig } from '@alien-worlds/api-core';

const start = () => {
  const vars = new ConfigVars();
  const config = buildBroadcastConfig(vars);
  Broadcast.startServer(config);
};

start();
