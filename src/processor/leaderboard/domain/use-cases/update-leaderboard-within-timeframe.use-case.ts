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
    private monthlyLeaderboardRepository: MonthlyLeaderboardRepository
  ) {}

  /**
   * @async
   */
  public async execute(
    updates: LeaderboardUpdate[],
    assets: AtomicAsset<MinigToolData>[],
    timeframe: LeaderboardTimeframe
  ): Promise<Result<UpdateStatus.Success | UpdateStatus.Failure>> {
    const newUpdates: Leaderboard[] = [];

    let repository: LeaderboardRepository;

    if (timeframe === LeaderboardTimeframe.Daily) {
      repository = this.dailyLeaderboardRepository;
    } else if (timeframe === LeaderboardTimeframe.Weekly) {
      repository = this.weeklyLeaderboardRepository;
    } else if (timeframe === LeaderboardTimeframe.Monthly) {
      repository = this.monthlyLeaderboardRepository;
    } else {
      return Result.withFailure(
        Failure.fromError(new UnknownLeaderboardTimeframeError(timeframe))
      );
    }

    // We can't fetch the data of all users from the list at once
    // because the leaderboard timeframes of individual players may differ from each other
    // We have to fetch data one at a time
    for (const update of updates) {
      const {
        username,
        walletId,
        bounty,
        points,
        landId,
        planetName,
        blockNumber,
        blockTimestamp,
      } = update;

      const usedAssets = assets.get(update.id);
      const { content: usersFound, failure: userSearchFailure } =
        await repository.findUsers([walletId]);

      if (userSearchFailure) {
        return Result.withFailure(userSearchFailure);
      }

      if (usersFound.length === 0) {
        newUpdates.push(
          Leaderboard.create(
            blockNumber,
            blockTimestamp,
            walletId,
            username,
            bounty,
            points,
            landId,
            planetName,
            usedAssets
          )
        );
      } else {
        const current = usersFound[0];
        //
        if (current.lastUpdateId !== update.id) {
          newUpdates.push(Leaderboard.cloneAndUpdate(current, update, usedAssets));
        }
      }
    }

    return repository.update(newUpdates);
  }

  /*methods*/
}
