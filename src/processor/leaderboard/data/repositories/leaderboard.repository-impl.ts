import {
  DataSourceBulkWriteError,
  Failure,
  Result,
  UpdateStatus,
} from '@alien-worlds/api-core';

import { LeaderboardArchiveMongoSource } from '../data-sources/leaderboard.mongo.source';
import { LeaderboardRedisSource } from '../data-sources/leaderboard.redis.source';
import { LeaderboardRepository } from '../../domain/repositories/leaderboard.repository';
import { Leaderboard } from '../../domain/entities/leaderboard';
import { LeaderboardOrder, LeaderboardSort } from '../../domain/leaderboard.enums';
import { ClearingRedisError } from '../../domain/errors/clearing-redis.error';
import { LeaderboardSnapshotMongoSource } from '../data-sources/leaderboard-snapshot.mongo.source';

export class LeaderboardRepositoryImpl implements LeaderboardRepository {
  constructor(
    protected readonly archiveSource: LeaderboardArchiveMongoSource,
    protected readonly snapshotSource: LeaderboardSnapshotMongoSource,
    protected readonly rankingsSource: LeaderboardRedisSource,
    protected readonly archiveBatchSize: number
  ) {}

  public async findUsers(
    walletIds: string[],
    includeRankings: boolean,
    fromDate?: Date,
    toDate?: Date
  ): Promise<Result<Leaderboard[], Error>> {
    const { rankingsSource, archiveSource, snapshotSource } = this;
    try {
      const now = Date.now();
      if (
        (!fromDate && !toDate) ||
        (now >= fromDate.getTime() && now <= toDate.getTime())
      ) {
        const documents = await snapshotSource.getSnapshots(walletIds);
        if (includeRankings) {
          const rankings = await rankingsSource.getRankings(walletIds);
          Object.keys(rankings).forEach(key => {
            documents[key].rankings = rankings[key];
          });
        }
        return Result.withContent(documents.map(Leaderboard.fromDocument));
      }

      const documents = await archiveSource.find({
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
    const { rankingsSource, archiveSource } = this;
    try {
      const now = Date.now();
      if (
        (!fromDate && !toDate) ||
        (now >= fromDate.getTime() && now <= toDate.getTime())
      ) {
        const structs = await rankingsSource.list({ sort, offset, limit, order });
        return Result.withContent(structs.map(Leaderboard.fromJson));
      }

      const documents = await archiveSource.find({
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
    const { rankingsSource, archiveSource } = this;
    try {
      const now = Date.now();
      if (
        (!fromDate && !toDate) ||
        (now >= fromDate.getTime() && now <= toDate.getTime())
      ) {
        const size = await rankingsSource.count();
        return Result.withContent(size);
      }

      const size = await archiveSource.count({
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
      const { rankingsSource, snapshotSource } = this;
      const structs = leaderboards.map(leaderboard => leaderboard.toJson());
      const documents = leaderboards.map(leaderboard => leaderboard.toDocument());

      await Promise.all([
        rankingsSource.update(structs),
        snapshotSource.updateSnapshots(documents),
      ]);

      return Result.withContent(UpdateStatus.Success);
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  public async archive(): Promise<Result<boolean>> {
    const { rankingsSource, archiveSource, snapshotSource } = this;
    let operationError: Error;

    try {
      const size = await rankingsSource.count();
      const batchSize = this.archiveBatchSize || 1000;
      const rounds = Math.ceil(size / batchSize);
      let round = 0;

      while (round < rounds) {
        const snapshots = await snapshotSource.find({
          filter: {},
          options: { skip: round * batchSize, limit: batchSize },
        });
        const wallets = snapshots.map(snapshot => snapshot.wallet_id);

        const rankings = await rankingsSource.getRankings(wallets);
        const documents = snapshots.map(docuemnt => {
          docuemnt.rankings = rankings[docuemnt.wallet_id];
          return docuemnt;
        });
        await archiveSource.insertMany(documents);

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
      const redisCleaned = await rankingsSource.clear();
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
