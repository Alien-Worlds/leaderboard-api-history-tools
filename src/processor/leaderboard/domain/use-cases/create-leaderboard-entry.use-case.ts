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
export class CreateLeaderboardEntryUseCase implements UseCase<Leaderboard> {
  public static Token = 'CREATE_LEADERBOARD_ENTRY_USE_CASE';

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
    update: LeaderboardUpdate,
    assets: AtomicAsset<MinigToolData>[],
  ): Promise<Result<Leaderboard>> {
    const {
      walletId,
username,
bounty,
blockNumber,
blockTimestamp,
points,
landId,
planetName,
bagItems,
updateId,
id,
    } = update;
    const toolsUsed = [];
    let totalChargeTime = 0;
    let totalMiningPower = 0;
    let totalNftPower = 0;
    let avgChargeTime = 0;
    let avgMiningPower = 0;
    let avgNftPower = 0;

    assets.forEach(asset => {
      const {
        assetId,
        data: { ease, delay, difficulty },
      } = asset;
      toolsUsed.push(assetId);
      totalChargeTime += delay || 0;
      totalMiningPower += ease || 0;
      totalNftPower += difficulty || 0;
    });
    const toolsCount = toolsUsed.length;

    if (toolsCount > 0) {
      avgChargeTime = totalChargeTime / toolsCount;
      avgMiningPower = totalMiningPower / toolsCount;
      avgNftPower = totalNftPower / toolsCount;
    }

    const lands = landId ? [landId] : [];
    const planets = planetName ? [planetName] : [];
    const rankingsMap = new Map<string, number>();

    if (rankings) {
      const keys = Object.keys(rankings);
      for (const key of keys) {
        rankingsMap.set(key, rankings[key]);
      }
    }

      const leaderboard = Leaderboard.create(
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
    return Result.withContent(leaderboard);
  }

  /*methods*/
}
