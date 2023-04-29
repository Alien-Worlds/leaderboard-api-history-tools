import { AtomicAsset } from '@alien-worlds/alienworlds-api-common';
import {
  Failure,
  inject,
  injectable,
  Result,
  UpdateStatus,
  UseCase,
} from '@alien-worlds/api-core';
import { MinigToolData } from '../../data/leaderboard.dtos';
import { Leaderboard } from '../entities/leaderboard';
import { LeaderboardUpdate } from '../entities/leaderboard-update';
import { DailyLeaderboardRepository } from '../repositories/daily-leaderboard.repository';
import { LeaderboardTimeframe } from '../leaderboard.enums';
import { WeeklyLeaderboardRepository } from '../repositories/weekly-leaderboard.repository';
import { MonthlyLeaderboardRepository } from '../repositories/monthly-leaderboard.repository';
import { LeaderboardRepository } from '../repositories/leaderboard.repository';
import { UnknownLeaderboardTimeframeError } from '../errors/unknown-leaderboard-timeframe.error';
import { CreateUserLeaderboardUseCase } from './create-user-leaderboard.use-case';
import { UpdateUserLeaderboardUseCase } from './update-user-leaderboard.use-case';
import { LeaderboardUpdateError } from '../errors/leaderboard-update.error';

/*imports*/
/**
 * @class
 */
@injectable()
export class UpdateLeaderboardWithinTimeframeUseCase
  implements UseCase<UpdateStatus.Success | UpdateStatus.Failure>
{
  public static Token = 'UPDATE_LEADERBOARD_WITHIN_TIMEFRAME_USE_CASE';

  constructor(
    @inject(DailyLeaderboardRepository.Token)
    private dailyLeaderboardRepository: DailyLeaderboardRepository,
    @inject(WeeklyLeaderboardRepository.Token)
    private weeklyLeaderboardRepository: WeeklyLeaderboardRepository,
    @inject(MonthlyLeaderboardRepository.Token)
    private monthlyLeaderboardRepository: MonthlyLeaderboardRepository,
    @inject(CreateUserLeaderboardUseCase.Token)
    private createLeaderboardEntryUseCase: CreateUserLeaderboardUseCase,
    @inject(UpdateUserLeaderboardUseCase.Token)
    private updateLeaderboardEntryUseCase: UpdateUserLeaderboardUseCase
  ) {}

  /**
   * @async
   */
  public async execute(
    timeframe: LeaderboardTimeframe,
    updates: LeaderboardUpdate[],
    assets?: AtomicAsset<MinigToolData>[]
  ): Promise<
    Result<UpdateStatus.Success | UpdateStatus.Failure, LeaderboardUpdateError>
  > {
    const newUpdates: Leaderboard[] = [];
    const failedUpdates: LeaderboardUpdate[] = [];
    let repository: LeaderboardRepository;

    if (timeframe === LeaderboardTimeframe.Daily) {
      repository = this.dailyLeaderboardRepository;
    } else if (timeframe === LeaderboardTimeframe.Weekly) {
      repository = this.weeklyLeaderboardRepository;
    } else if (timeframe === LeaderboardTimeframe.Monthly) {
      repository = this.monthlyLeaderboardRepository;
    } else {
      return Result.withFailure(
        Failure.fromError(
          new LeaderboardUpdateError(
            updates.length,
            updates,
            new UnknownLeaderboardTimeframeError(timeframe)
          )
        )
      );
    }

    const wallets = updates.map(update => update.walletId);

    const leaderboardSearch = await repository.findUsers(wallets, false);

    if (leaderboardSearch.isFailure) {
      return Result.withFailure(
        Failure.fromError(new LeaderboardUpdateError(updates.length, updates))
      );
    }

    for (const update of updates) {
      const userLeaderboard = leaderboardSearch.content.filter(
        row => row.walletId === update.walletId
      )[0];

      if (!userLeaderboard) {
        const newLeaderboard = await this.createLeaderboardEntryUseCase.execute(
          update,
          assets
        );

        if (newLeaderboard.isFailure) {
          failedUpdates.push(update);
          continue;
        }

        newUpdates.push(newLeaderboard.content);
      } else {
        const updatedLeaderboard = await this.updateLeaderboardEntryUseCase.execute(
          userLeaderboard,
          update,
          assets
        );

        if (updatedLeaderboard.isFailure) {
          failedUpdates.push(update);
          continue;
        }

        newUpdates.push(updatedLeaderboard.content);
      }
    }

    if (newUpdates.length > 0) {
      const updateResult = await repository.update(newUpdates);

      if (updateResult.isFailure) {
        failedUpdates.push(...updates);
      }
    }

    if (failedUpdates.length > 0) {
      return Result.withFailure(
        Failure.fromError(new LeaderboardUpdateError(updates.length, failedUpdates))
      );
    }

    return Result.withContent(UpdateStatus.Success);
  }

  /*methods*/
}
