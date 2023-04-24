import {
  inject,
  injectable,
  Result,
  UpdateStatus,
  UseCase,
} from '@alien-worlds/api-core';
import { LeaderboardUpdate } from '../entities/leaderboard-update';
import { MinigToolData } from '../../data/leaderboard.dtos';
import { AtomicAsset } from '@alien-worlds/alienworlds-api-common';
import { LeaderboardUpdateError } from '../errors/leaderboard-update.error';
import { UpdateLeaderboardWithinTimeframeUseCase } from './update-leaderboard-within-timeframe.use-case';
import { LeaderboardTimeframe } from '../leaderboard.enums';

/*imports*/
/**
 * @class
 */
@injectable()
export class UpdateLeaderboardUseCase
  implements UseCase<UpdateStatus.Success | UpdateStatus.Failure>
{
  public static Token = 'UPDATE_LEADERBOARD_USE_CASE';

  constructor(
    @inject(UpdateLeaderboardWithinTimeframeUseCase.Token)
    private updateLeaderboardWithinTimeframeUseCase: UpdateLeaderboardWithinTimeframeUseCase
  ) {}

  /**
   * @async
   */
  public async execute(
    updates: LeaderboardUpdate[],
    assets?: AtomicAsset<MinigToolData>[]
  ): Promise<
    Result<UpdateStatus.Success | UpdateStatus.Failure, LeaderboardUpdateError>
  > {
    /*
     * UPDATE DAILY LEADERBOARD
     */
    const dailyUpdate = await this.updateLeaderboardWithinTimeframeUseCase.execute(
      LeaderboardTimeframe.Daily,
      updates,
      assets
    );

    if (dailyUpdate.isFailure) {
      return Result.withFailure(dailyUpdate.failure);
    }

    /*
     * UPDATE WEEKLY LEADERBOARD
     */

    const weeklyUpdate = await this.updateLeaderboardWithinTimeframeUseCase.execute(
      LeaderboardTimeframe.Weekly,
      updates,
      assets
    );

    if (weeklyUpdate.isFailure) {
      return Result.withFailure(weeklyUpdate.failure);
    }

    /*
     * UPDATE MONTHLY LEADERBOARD
     */

    const monthlyUpdate = await this.updateLeaderboardWithinTimeframeUseCase.execute(
      LeaderboardTimeframe.Monthly,
      updates,
      assets
    );

    if (monthlyUpdate.isFailure) {
      return Result.withFailure(monthlyUpdate.failure);
    }

    return Result.withContent(UpdateStatus.Success);
  }

  /*methods*/
}
