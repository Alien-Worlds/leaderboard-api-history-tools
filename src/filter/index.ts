import {
  startFilter,
  DefaultFilterDependencies,
} from '@alien-worlds/aw-history-starter-kit';
import path from 'path';

startFilter(
  process.argv,
  new DefaultFilterDependencies(),
  path.join(__dirname, '../../leaderboard.featured.json')
);
