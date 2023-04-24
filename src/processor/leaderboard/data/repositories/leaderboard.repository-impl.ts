import {
  DataSourceBulkWriteError,
  Failure,
  Result,
  UpdateStatus,
} from '@alien-worlds/api-core';

import { LeaderboardMongoSource } from '../data-sources/leaderboard.mongo.source';
import { LeaderboardRedisSource } from '../data-sources/leaderboard.redis.source';
import { LeaderboardRepository } from '../../domain/repositories/leaderboard.repository';
import { Leaderboard } from '../../domain/entities/leaderboard';
import { LeaderboardOrder, LeaderboardSort } from '../../domain/leaderboard.enums';
import { ClearingRedisError } from '../../domain/errors/clearing-redis.error';

export class LeaderboardRepositoryImpl implements LeaderboardRepository {
  constructor(
    protected readonly mongoSource: LeaderboardMongoSource,
    protected readonly redisSource: LeaderboardRedisSource,
    protected readonly archiveBatchSize: number
  ) {}

  public async findUsers(
    walletIds: string[],
    fromDate?: Date,
    toDate?: Date
  ): Promise<Result<Leaderboard[], Error>> {
    const { redisSource, mongoSource } = this;
    try {
      const now = Date.now();
      if (
        (!fromDate && !toDate) ||
        (now >= fromDate.getTime() && now <= toDate.getTime())
      ) {
        const structs = await redisSource.findUsers(walletIds);
        return Result.withContent(structs.map(Leaderboard.fromJson));
      }

      const documents = await mongoSource.find({
        filter: {
          $and: [
            {
              start_timestamp: { $gte: new Date(fromDate.toISOString()) },
            },
            {
              end_timestamp: { $lte: new Date(toDate.toISOString()) },
            },
            {
              wallet_id: { $in: walletIds },
            },
          ],
        },
      });

      return Result.withContent(documents.map(Leaderboard.fromDocument));
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  public async list(
    sort: LeaderboardSort,
    offset: number,
    limit: number,
    order: LeaderboardOrder,
    fromDate?: Date,
    toDate?: Date
  ): Promise<Result<Leaderboard[]>> {
    const { redisSource, mongoSource } = this;
    try {
      const now = Date.now();
      if (
        (!fromDate && !toDate) ||
        (now >= fromDate.getTime() && now <= toDate.getTime())
      ) {
        const structs = await redisSource.list({ sort, offset, limit, order });
        return Result.withContent(structs.map(Leaderboard.fromJson));
      }

      const documents = await mongoSource.find({
        filter: {
          $and: [
            {
              start_timestamp: { $gte: new Date(fromDate.toISOString()) },
            },
            {
              end_timestamp: { $lte: new Date(toDate.toISOString()) },
            },
          ],
        },
        options: {
          sort: JSON.parse(`{ "${sort}": ${order || -1} }`),
          skip: Number(offset),
          limit: Number(limit),
        },
      });

      return Result.withContent(documents.map(Leaderboard.fromDocument));
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  public async count(fromDate?: Date, toDate?: Date): Promise<Result<number, Error>> {
    const { redisSource, mongoSource } = this;
    try {
      const now = Date.now();
      if (
        (!fromDate && !toDate) ||
        (now >= fromDate.getTime() && now <= toDate.getTime())
      ) {
        const size = await redisSource.count();
        return Result.withContent(size);
      }

      const size = await mongoSource.count({
        filter: {
          $and: [
            {
              start_timestamp: { $gte: new Date(fromDate.toISOString()) },
            },
            {
              end_timestamp: { $lte: new Date(toDate.toISOString()) },
            },
          ],
        },
      });

      return Result.withContent(size);
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  public async update(
    leaderboards: Leaderboard[]
  ): Promise<Result<UpdateStatus.Success | UpdateStatus.Failure>> {
    try {
      const structs = leaderboards.map(leaderboard => leaderboard.toJson());

      await this.redisSource.update(structs);

      return Result.withContent(UpdateStatus.Success);
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  public async archive(): Promise<Result<boolean>> {
    const { redisSource, mongoSource } = this;
    let operationError: Error;

    try {
      const size = await redisSource.count();
      const batchSize = this.archiveBatchSize || 10000;
      const rounds = Math.ceil(size / batchSize);
      let round = 0;

      while (round < rounds) {
        const list = await redisSource.list({
          offset: round * batchSize,
          limit: batchSize,
        });
        const documents = list.map(item => Leaderboard.fromJson(item).toDocument());
        await mongoSource.insertMany(documents);

        round++;
      }
    } catch (error) {
      if (error instanceof DataSourceBulkWriteError) {
        error.writeErrors.forEach(writeError => {
          if (writeError.isDuplicateError === false) {
            operationError = error;
          }
        });
      } else {
        operationError = error;
      }
    }

    if (!operationError) {
      const redisCleaned = await redisSource.clear();
      if (!redisCleaned) {
        operationError = new ClearingRedisError();
      }
    }

    if (operationError) {
      return Result.withFailure(Failure.fromError(operationError));
    }

    return Result.withContent(true);
  }
}
