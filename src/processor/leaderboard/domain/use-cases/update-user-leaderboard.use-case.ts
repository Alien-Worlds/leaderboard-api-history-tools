import { AtomicAsset } from '@alien-worlds/alienworlds-api-common';
import { injectable, Result, UseCase } from '@alien-worlds/api-core';
import { MinigToolData } from '../../data/leaderboard.dtos';
import { Leaderboard } from '../entities/leaderboard';
import { LeaderboardUpdate } from '../entities/leaderboard-update';
import { nanoid } from 'nanoid';

/*imports*/
/**
 * @class
 */
@injectable()
export class UpdateUserLeaderboardUseCase implements UseCase<Leaderboard> {
  public static Token = 'UPDATE_USER_LEADERBOARD_USE_CASE';

  /**
   * @async
   */
  public async execute(
    current: Leaderboard,
    update: LeaderboardUpdate,
    assets: AtomicAsset<MinigToolData>[]
  ): Promise<Result<Leaderboard>> {
    const points = update.points || 0;
    const bounty = update.bounty || 0;
    const toolsUsed: bigint[] = current.toolsUsed || [];
    const lands = current.lands;
    const planets = current.planets;
    let totalChargeTime = current.totalChargeTime;
    let totalMiningPower = current.totalMiningPower;
    let totalNftPower = current.totalNftPower;

    if (update.planetName && planets.indexOf(update.planetName)) {
      planets.push(update.planetName);
    }

    if (update.landId && lands.indexOf(update.landId)) {
      lands.push(update.landId);
    }

    assets.forEach(asset => {
      const {
        assetId,
        data: { ease, delay, difficulty },
      } = asset;

      if (toolsUsed.indexOf(assetId) === -1) {
        toolsUsed.push(assetId);
        totalChargeTime += delay;
        totalMiningPower += ease;
        totalNftPower += difficulty;
      }
    });

    const toolsCount = toolsUsed.length;
    const avgChargeTime = toolsCount
      ? totalChargeTime / toolsCount
      : current.avgChargeTime;
    const avgMiningPower = toolsCount
      ? totalMiningPower / toolsCount
      : current.avgMiningPower;
    const avgNftPower = toolsCount ? totalNftPower / toolsCount : current.avgNftPower;

    const leaderboard = Leaderboard.create(
      update.blockNumber,
      update.blockTimestamp,
      update.walletId,
      update.username || current.username,
      current.tlmGainsTotal + bounty,
      current.tlmGainsHighest < bounty ? bounty : current.tlmGainsHighest,
      current.totalNftPoints + points,
      totalChargeTime,
      avgChargeTime,
      totalMiningPower,
      avgMiningPower,
      totalNftPower,
      avgNftPower,
      lands,
      planets,
      toolsUsed,
      {},
      nanoid()
    );
    return Result.withContent(leaderboard);
  }

  /*methods*/
}