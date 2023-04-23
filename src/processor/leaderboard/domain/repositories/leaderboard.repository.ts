import { Result, UpdateStatus, injectable } from '@alien-worlds/api-core';
import { Leaderboard } from '../entities/leaderboard';
import { LeaderboardOrder, LeaderboardSort } from '../leaderboard.enums';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class LeaderboardRepository {
  public static Token = 'LEADERBOARD_REPOSITORY';

  public abstract findUsers(
    walletIds: string[],
    fromDate?: Date,
    toDate?: Date
  ): Promise<Result<Leaderboard[], Error>>;

  public abstract list(
    sort: LeaderboardSort,
    offset: number,
    limit: number,
    order: LeaderboardOrder,
    fromDate?: Date,
    toDate?: Date
  ): Promise<Result<Leaderboard[]>>;

  public abstract update(
    leaderboards: Leaderboard[]
  ): Promise<Result<UpdateStatus.Success | UpdateStatus.Failure>>;

  public abstract count(fromDate?: Date, toDate?: Date): Promise<Result<number, Error>>;
  public abstract archive(): Promise<Result<boolean>>;
}
