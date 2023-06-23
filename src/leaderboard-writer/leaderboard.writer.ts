import { MongoSource, log } from '@alien-worlds/api-core';
import { WorkerPool } from '@alien-worlds/api-history-tools';
import { leaderboardWorkerLoaderPath } from './leaderboard.consts';
import { LeaderboardWriterConfig } from './leaderboard.types';
import {
  LeaderboardUpdateMongoSource,
  LeaderboardUpdateRepository,
  LeaderboardUpdateRepositoryImpl,
} from '@alien-worlds/leaderboard-api-common';

export class LeaderboardWriter {
  public static async create(config: LeaderboardWriterConfig) {
    const { workers, atomicassets, leaderboard, mongo, updateBatchSize } = config;
    const workerPool = await WorkerPool.create({
      ...workers,
      sharedData: { config: { atomicassets, leaderboard, mongo, updateBatchSize } },
      workerLoaderPath: leaderboardWorkerLoaderPath,
    });
    const mongoSource = await MongoSource.create(mongo);
    const leaderboardUpdateMongoSource = new LeaderboardUpdateMongoSource(mongoSource);
    const updatesRepository = new LeaderboardUpdateRepositoryImpl(
      leaderboardUpdateMongoSource
    );
    const runner = new LeaderboardWriter(workerPool, updatesRepository);

    workerPool.onWorkerRelease(() => runner.next());

    log(` *  Worker Pool (max ${workerPool.workerMaxCount} workers) ... [ready]`);

    return runner;
  }

  private interval: NodeJS.Timeout;
  private loop: boolean;

  constructor(
    private workerPool: WorkerPool,
    private updatesRepository: LeaderboardUpdateRepository
  ) {
    this.interval = setInterval(async () => {
      if (this.workerPool.hasActiveWorkers() === false) {
        log(`All workers are available, Checking for updates to perform...`);
        this.next();
      }
    }, 5000);
  }

  public async next() {
    const { workerPool, updatesRepository } = this;

    // block multiple requests
    if (this.loop) {
      return;
    }

    this.loop = true;

    while (this.loop) {
      const { content: count } = await updatesRepository.count();
      if (count > 0) {
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

          worker.run();
        } else {
          this.loop = false;
        }
      } else {
        this.loop = false;
      }
    }
  }
}
