import { log } from '@alien-worlds/api-core';
import { WorkerPool } from '@alien-worlds/api-history-tools';
import { leaderboardWorkerLoaderPath } from './leaderboard.consts';
import { LeaderboardUpdaterConfig } from './leaderboard.types';

export class LeaderboardUpdater {
  public static async create(config: LeaderboardUpdaterConfig) {
    const { workers, atomicassets, leaderboard, mongo } = config;
    const workerPool = await WorkerPool.create({
      ...workers,
      sharedData: { config: { atomicassets, leaderboard, mongo } },
      workerLoaderPath: leaderboardWorkerLoaderPath,
    });
    const runner = new LeaderboardUpdater(workerPool);

    workerPool.onWorkerRelease(() => runner.next());

    log(` *  Worker Pool (max ${workerPool.workerMaxCount} workers) ... [ready]`);

    return runner;
  }

  private interval: NodeJS.Timeout;
  private loop: boolean;

  constructor(private workerPool: WorkerPool) {
    this.interval = setInterval(async () => {
      if (this.workerPool.hasActiveWorkers() === false) {
        log(`All workers are available, checking if there blocks to parse...`);
        this.next();
      }
    }, 5000);
  }

  public async next() {
    const { workerPool } = this;

    // block multiple requests
    if (this.loop) {
      return;
    }

    this.loop = true;

    while (this.loop) {
      const worker = await workerPool.getWorker();
      if (worker) {
        worker.onMessage(async message => {
          if (message.isTaskRejected()) {
            log(message.error);
          }
          workerPool.releaseWorker(message.workerId);
        });
        worker.onError((id, error) => {
          log(error);
          workerPool.releaseWorker(id);
        });

        worker.run({});
      } else {
        this.loop = false;
      }
    }
  }
}
