import {
  HashCollectionRedisSource,
  log,
  RedisSource,
  SortedCollectionRedisSource,
} from '@alien-worlds/api-core';
import {
  LeaderboardJson,
  LeaderboardUserRankingsStruct,
  LeaderboardUserScoresStruct,
} from '../leaderboard.dtos';
import { LeaderboardSort } from '../../domain/leaderboard.enums';

/**
 * @class
 */
export class LeaderboardRedisSource {
  private collections = new Map<string, SortedCollectionRedisSource>();
  private data: HashCollectionRedisSource;

  /**
   * @constructor
   * @param {RedisSource} redisSource
   */
  constructor(redisSource: RedisSource, private prefix: string) {
    this.data = new HashCollectionRedisSource(redisSource, `${prefix}_user_data`);

    this.collections.set(
      LeaderboardSort.TlmGainsTotal,
      new SortedCollectionRedisSource(redisSource, `${prefix}_tlm_gains_total`)
    );
    this.collections.set(
      LeaderboardSort.TotalNftPoints,
      new SortedCollectionRedisSource(redisSource, `${prefix}_total_nft_points`)
    );
    this.collections.set(
      LeaderboardSort.UniqueToolsUsed,
      new SortedCollectionRedisSource(redisSource, `${prefix}_unique_tools_used`)
    );
    this.collections.set(
      LeaderboardSort.AvgChargeTime,
      new SortedCollectionRedisSource(redisSource, `${prefix}_avg_charge_time`)
    );
    this.collections.set(
      LeaderboardSort.AvgMiningPower,
      new SortedCollectionRedisSource(redisSource, `${prefix}_avg_mining_power`)
    );
    this.collections.set(
      LeaderboardSort.AvgNftPower,
      new SortedCollectionRedisSource(redisSource, `${prefix}_avg_nft_power`)
    );
    this.collections.set(
      LeaderboardSort.LandsMinedOn,
      new SortedCollectionRedisSource(redisSource, `${prefix}_lands_mined_on`)
    );
    this.collections.set(
      LeaderboardSort.PlanetsMinedOn,
      new SortedCollectionRedisSource(redisSource, `${prefix}_planets_mined_on`)
    );
  }

  public async update(leaderboards: LeaderboardJson[]) {
    const tlmGainsTotal = [];
    const totalNftPoints = [];
    const uniqueToolsUsed = [];
    const avgChargeTime = [];
    const avgMiningPower = [];
    const avgNftPower = [];
    const landsMinedOn = [];
    const planetsMinedOn = [];
    const data = [];

    for (const leaderboard of leaderboards) {
      const {
        wallet_id,
        tlm_gains_total,
        total_nft_points,
        avg_charge_time,
        avg_mining_power,
        avg_nft_power,
        lands_mined_on,
        planets_mined_on,
        unique_tools_used,
      } = leaderboard;
      tlmGainsTotal.push({ score: tlm_gains_total, value: wallet_id });
      totalNftPoints.push({ score: total_nft_points, value: wallet_id });
      uniqueToolsUsed.push({ score: unique_tools_used, value: wallet_id });
      avgChargeTime.push({ score: avg_charge_time, value: wallet_id });
      avgMiningPower.push({ score: avg_mining_power, value: wallet_id });
      avgNftPower.push({ score: avg_nft_power, value: wallet_id });
      landsMinedOn.push({ score: lands_mined_on, value: wallet_id });
      planetsMinedOn.push({ score: planets_mined_on, value: wallet_id });
      data.push({
        key: wallet_id,
        value: JSON.stringify(leaderboard),
      });
    }

    this.collections.get(LeaderboardSort.TlmGainsTotal).addMany(tlmGainsTotal);
    this.collections.get(LeaderboardSort.TotalNftPoints).addMany(totalNftPoints);
    this.collections.get(LeaderboardSort.UniqueToolsUsed).addMany(uniqueToolsUsed);
    this.collections.get(LeaderboardSort.AvgChargeTime).addMany(avgChargeTime);
    this.collections.get(LeaderboardSort.AvgMiningPower).addMany(avgMiningPower);
    this.collections.get(LeaderboardSort.AvgNftPower).addMany(avgNftPower);
    this.collections.get(LeaderboardSort.LandsMinedOn).addMany(landsMinedOn);
    this.collections.get(LeaderboardSort.PlanetsMinedOn).addMany(planetsMinedOn);
    this.data.addMany(data);
  }

  public async getRankings(
    wallets: string[],
    keys?: LeaderboardSort[],
    order?: number
  ): Promise<LeaderboardUserRankingsStruct> {
    const result = {};
    const rankKeys =
      Array.isArray(keys) && keys.length > 0 ? keys : Object.values(LeaderboardSort);
    for (const walletId of wallets) {
      const scores = {};
      for (const key of rankKeys) {
        if (this.collections.has(key)) {
          const rank = await this.collections.get(key).getRank(walletId, order || -1);
          scores[key] = rank > -1 ? rank + 1 : -1;
        } else {
          log(`Unknown key: ${key}`);
        }
      }
      result[walletId] = scores;
    }
    return result;
  }

  public async getUsersData(wallets: string[]): Promise<LeaderboardJson[]> {
    const structs = await this.data.list(wallets);
    return Object.values(structs).reduce<LeaderboardJson[]>((list, str) => {
      if (str) {
        list.push(JSON.parse(str));
      }
      return list;
    }, []);
  }

  public async getScores(
    wallets: string[],
    keys?: string[]
  ): Promise<LeaderboardUserScoresStruct> {
    const props =
      Array.isArray(keys) && keys.length > 0 ? keys : Object.values(LeaderboardSort);
    const result = {};
    for (const walletId of wallets) {
      const scores = {};
      for (const prop of props) {
        const value = await this.collections.get(prop).getScore(walletId);
        if (value) {
          scores[prop] = value;
        }
      }
      result[walletId] = scores;
    }
    return result;
  }

  public async clear(): Promise<boolean> {
    const props = Object.values(LeaderboardSort);
    let success = await this.data.clear();

    for (const prop of props) {
      const result = await this.collections.get(prop).clear();
      if (result === false) {
        log(`The collection of ${prop} has not been cleared.`);
        success = false;
      }
    }

    return success;
  }

  public async count(sort?: string): Promise<number> {
    return this.collections.get(sort || LeaderboardSort.TlmGainsTotal).count();
  }

  public async list(options: {
    sort?: string;
    offset?: number;
    limit?: number;
    order?: number;
  }): Promise<LeaderboardJson[]> {
    const { sort } = options;
    const offset = options.offset || 0;
    const limit = options.limit || 10;
    const order = options.order || -1;
    const sorts = [];
    const structsByWallets = new Map<string, LeaderboardJson>();

    if (sort && this.collections.has(sort)) {
      sorts.push(sort);
    } else {
      sorts.push(...Object.values(LeaderboardSort));
    }

    for (const sort of sorts) {
      const list = await this.collections.get(sort).list(offset, limit, order);

      for (const item of list) {
        const { rank, score, value } = item;
        let struct = structsByWallets.get(value);

        if (!struct) {
          struct = (await this.getUsersData([value]))[0];
          struct.rankings = {};
          structsByWallets.set(value, struct);
        }

        struct[sort] = score;
        struct.rankings[sort] = rank > -1 ? rank + 1 : -1;
      }
    }

    return Array.from(structsByWallets.values());
  }

  public async findUsers(
    wallets: string[],
    rankOrder?: number
  ): Promise<LeaderboardJson[]> {
    const usersData = await this.getUsersData(wallets);
    const usersRankings = await this.getRankings(wallets, [], rankOrder);
    const structs = [];

    for (const struct of usersData) {
      const ranks = usersRankings[struct.wallet_id];
      struct.rankings = ranks;
      structs.push(struct);
    }

    return structs;
  }
}