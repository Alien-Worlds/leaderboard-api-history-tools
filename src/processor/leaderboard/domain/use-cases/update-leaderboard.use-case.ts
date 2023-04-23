import {
  inject,
  injectable,
  Result,
  UpdateStatus,
  UseCase,
} from '@alien-worlds/api-core';
import { UpdateDailyLeaderboardUseCase } from './update-leaderboard-within-timeframe.use-case';
import { UpdateMonthlyLeaderboardUseCase } from './update-monthly-leaderboard.use-case';
import { UpdateWeeklyLeaderboardUseCase } from './update-weekly-leaderboard.use-case';
import { LeaderboardUpdate } from '../entities/leaderboard-update';
import { GetAtomicAssetsUseCase } from '../../../atomic-assets/domain/use-cases/get-atomic-assets.use-case';
import { AtomicAsset } from '@alien-worlds/alienworlds-api-common';
import { MinigToolData } from '../../data/leaderboard.dtos';

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
    @inject(UpdateDailyLeaderboardUseCase.Token)
    private updateDailyLeaderboardUseCase: UpdateDailyLeaderboardUseCase,
    @inject(UpdateWeeklyLeaderboardUseCase.Token)
    private updateWeeklyLeaderboardUseCase: UpdateWeeklyLeaderboardUseCase,
    @inject(UpdateMonthlyLeaderboardUseCase.Token)
    private updateMonthlyLeaderboardUseCase: UpdateMonthlyLeaderboardUseCase,
    @inject(GetAtomicAssetsUseCase.Token)
    private getAtomicAssetsUseCase: GetAtomicAssetsUseCase
  ) {}

  /**
   * @async
   */
  public async execute(
    updates: LeaderboardUpdate[]
  ): Promise<Result<UpdateStatus.Success | UpdateStatus.Failure>> {
    const assetIds = updates.reduce((list, update) => {
      list.push(...update.bagItems);
      return list;
    }, []);
    const { content, failure: assetsFailure } = await this.getAtomicAssetsUseCase.execute(
      assetIds
    );
    const assets = content as AtomicAsset<MinigToolData>[];

    if (assetsFailure) {
      return Result.withFailure(assetsFailure);
    }

    /*
     * UPDATE DAILY LEADERBOARD
     */
    const dailyUpdate = await this.updateDailyLeaderboardUseCase.execute(updates, assets);

    if (dailyUpdate.isFailure) {
      return Result.withFailure(dailyUpdate.failure);
    }

    /*
     * UPDATE WEEKLY LEADERBOARD
     */

    const weeklyUpdate = await this.updateWeeklyLeaderboardUseCase.execute(
      updates,
      assets
    );

    if (weeklyUpdate.isFailure) {
      return Result.withFailure(weeklyUpdate.failure);
    }

    /*
     * UPDATE MONTHLY LEADERBOARD
     */

    const monthlyUpdate = await this.updateMonthlyLeaderboardUseCase.execute(
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
