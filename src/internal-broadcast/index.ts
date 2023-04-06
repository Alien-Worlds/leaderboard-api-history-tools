import { Broadcast } from '@alien-worlds/api-core';
import { buildConfig } from '../config/config';

const start = () => {
  const config = buildConfig();
  Broadcast.startServer(config.broadcast);
};

start();
