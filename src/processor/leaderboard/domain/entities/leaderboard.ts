import { LeaderboardDocument, LeaderboardJson } from '../../data/leaderboard.dtos';
import {
  MongoDB,
  parseToBigInt,
  removeUndefinedProperties,
} from '@alien-worlds/api-core';

import { LeaderboardNumbers } from './../../data/leaderboard.dtos';
import { nanoid } from 'nanoid';
import { LeaderboardSort } from '../leaderboard.enums';

/**
 * @class
 */
export class Leaderboard {
  /**
   *
   * @static
   * @param {LeaderboardDocument} document
   * @returns {Leaderboard}
   */
  public static fromDocument(document: LeaderboardDocument): Leaderboard {
    const {
      _id,
      last_update_timestamp,
      last_update_id,
      last_block_number,
      last_block_timestamp,
      username,
      wallet_id,
      tlm_gains_total,
      tlm_gains_highest,
      total_nft_points,
      tools_used,
      total_charge_time,
      avg_charge_time,
      total_mining_power,
      avg_mining_power,
      total_nft_power,
      avg_nft_power,
      lands,
      planets,
      rankings,
    } = document;

    const rankingsMap = new Map<string, number>();

    if (rankings) {
      const keys = Object.keys(rankings);
      for (const key of keys) {
        rankingsMap.set(key, rankings[key]);
      }
    }

    return new Leaderboard(
      parseToBigInt(last_block_number),
      last_block_timestamp,
      wallet_id,
      username,
      tlm_gains_total,
      tlm_gains_highest,
      total_nft_points,
      tools_used ? tools_used.map(id => parseToBigInt(id)) : [],
      total_charge_time,
      avg_charge_time,
      total_mining_power,
      avg_mining_power,
      total_nft_power,
      avg_nft_power,
      lands ? lands.map(id => parseToBigInt(id)) : [],
      planets,
      last_update_timestamp ? new Date(last_update_timestamp) : new Date(),
      last_update_id,
      rankingsMap,
      _id instanceof MongoDB.ObjectId ? _id.toString() : ''
    );
  }

  public static fromJson(json: LeaderboardJson): Leaderboard {
    const {
      last_update_timestamp,
      last_update_id,
      last_block_number,
      last_block_timestamp,
      username,
      wallet_id,
      tlm_gains_total,
      tlm_gains_highest,
      total_nft_points,
      tools_used,
      total_charge_time,
      avg_charge_time,
      total_mining_power,
      avg_mining_power,
      total_nft_power,
      avg_nft_power,
      lands,
      planets,
      rankings,
    } = json;

    const rankingsMap = new Map<string, number>();

    if (rankings) {
      const keys = Object.keys(rankings);
      for (const key of keys) {
        rankingsMap.set(key, rankings[key]);
      }
    }

    return new Leaderboard(
      parseToBigInt(last_block_number),
      new Date(last_block_timestamp),
      wallet_id,
      username,
      tlm_gains_total,
      tlm_gains_highest,
      total_nft_points,
      tools_used ? tools_used.map(id => parseToBigInt(id)) : [],
      total_charge_time,
      avg_charge_time,
      total_mining_power,
      avg_mining_power,
      total_nft_power,
      avg_nft_power,
      lands ? lands.map(id => parseToBigInt(id)) : [],
      planets,
      last_update_timestamp ? new Date(last_update_timestamp) : new Date(),
      last_update_id,
      rankingsMap,
      ''
    );
  }

  public static create(
    blockNumber: bigint,
    blockTimestamp: Date,
    walletId: string,
    username: string,
    bounty: number,
    bountyHighest: number,
    points: number,
    totalChargeTime: number,
    avgChargeTime: number,
    totalMiningPower: number,
    avgMiningPower: number,
    totalNftPower: number,
    avgNftPower: number,
    lands: bigint[],
    planets: string[],
    assets: bigint[],
    rankings?: LeaderboardNumbers,
    lastUpdateId?: string
  ): Leaderboard {
    const rankingsMap = new Map<string, number>();
    const ranks = rankings || {};

    rankingsMap.set(
      LeaderboardSort.AvgChargeTime,
      ranks[LeaderboardSort.AvgChargeTime] || 0
    );
    rankingsMap.set(
      LeaderboardSort.AvgMiningPower,
      ranks[LeaderboardSort.AvgMiningPower] || 0
    );
    rankingsMap.set(LeaderboardSort.AvgNftPower, ranks[LeaderboardSort.AvgNftPower] || 0);
    rankingsMap.set(
      LeaderboardSort.LandsMinedOn,
      ranks[LeaderboardSort.LandsMinedOn] || 0
    );
    rankingsMap.set(
      LeaderboardSort.PlanetsMinedOn,
      ranks[LeaderboardSort.PlanetsMinedOn] || 0
    );
    rankingsMap.set(
      LeaderboardSort.TlmGainsTotal,
      ranks[LeaderboardSort.TlmGainsTotal] || 0
    );
    rankingsMap.set(
      LeaderboardSort.TotalNftPoints,
      ranks[LeaderboardSort.TotalNftPoints] || 0
    );
    rankingsMap.set(
      LeaderboardSort.UniqueToolsUsed,
      ranks[LeaderboardSort.UniqueToolsUsed] || 0
    );

    return new Leaderboard(
      blockNumber,
      blockTimestamp,
      walletId,
      username,
      Number(bounty) || 0,
      Number(bountyHighest || bounty) || 0,
      Number(points) || 0,
      assets,
      totalChargeTime,
      avgChargeTime,
      totalMiningPower,
      avgMiningPower,
      totalNftPower,
      avgNftPower,
      lands,
      planets,
      new Date(),
      lastUpdateId || nanoid(),
      rankingsMap,
      ''
    );
  }

  /**
   * @constructor
   */
  protected constructor(
    public readonly lastBlockNumber: bigint,
    public readonly lastBlockTimestamp: Date,
    public readonly walletId: string,
    public readonly username: string,
    public readonly tlmGainsTotal: number,
    public readonly tlmGainsHighest: number,
    public readonly totalNftPoints: number,
    public readonly toolsUsed: bigint[],
    public readonly totalChargeTime: number,
    public readonly avgChargeTime: number,
    public readonly totalMiningPower: number,
    public readonly avgMiningPower: number,
    public readonly totalNftPower: number,
    public readonly avgNftPower: number,
    public readonly lands: bigint[],
    public readonly planets: string[],
    public readonly lastUpdateTimestamp: Date,
    public readonly lastUpdateId: string,
    public readonly rankings: Map<string, number>,
    public readonly id: string
  ) {}

  public get uniqueToolsUsed(): number {
    return this.toolsUsed.length;
  }
  public get landsMinedOn(): number {
    return this.lands.length;
  }
  public get planetsMinedOn(): number {
    return this.planets.length;
  }

  /**
   *
   * @returns {LeaderboardDocument}
   */
  public toDocument(): LeaderboardDocument {
    const {
      id,
      lastUpdateTimestamp,
      lastBlockNumber,
      lastBlockTimestamp,
      walletId,
      username,
      tlmGainsTotal,
      tlmGainsHighest,
      totalNftPoints,
      toolsUsed,
      uniqueToolsUsed,
      totalChargeTime,
      avgChargeTime,
      totalMiningPower,
      avgMiningPower,
      totalNftPower,
      avgNftPower,
      lands,
      landsMinedOn,
      planets,
      planetsMinedOn,
      lastUpdateId,
      rankings,
    } = this;

    const document: LeaderboardDocument = {
      last_update_timestamp: lastUpdateTimestamp,
      last_update_id: lastUpdateId,
      last_block_number: MongoDB.Long.fromBigInt(lastBlockNumber),
      last_block_timestamp: lastBlockTimestamp,
      username,
      wallet_id: walletId,
      tlm_gains_total: tlmGainsTotal,
      tlm_gains_highest: tlmGainsHighest,
      total_nft_points: totalNftPoints,
      total_charge_time: totalChargeTime,
      avg_charge_time: avgChargeTime,
      total_mining_power: totalMiningPower,
      avg_mining_power: avgMiningPower,
      total_nft_power: totalNftPower,
      avg_nft_power: avgNftPower,
      lands_mined_on: landsMinedOn,
      planets_mined_on: planetsMinedOn,
      unique_tools_used: uniqueToolsUsed,
      tools_used: toolsUsed.map(id => MongoDB.Long.fromBigInt(id)),
      lands: lands.map(land => MongoDB.Long.fromBigInt(land)),
      planets,
    };

    if (rankings.size > 0) {
      document.rankings = {};
      rankings.forEach((value, key) => {
        document.rankings[key] = value;
      });
    }

    if (id && MongoDB.ObjectId.isValid(id)) {
      document._id = new MongoDB.ObjectId(id);
    }

    return removeUndefinedProperties<LeaderboardDocument>(document);
  }

  public toJson(): LeaderboardJson {
    const {
      lastUpdateTimestamp,
      lastUpdateId,
      lastBlockNumber,
      lastBlockTimestamp,
      walletId,
      username,
      tlmGainsTotal,
      tlmGainsHighest,
      totalNftPoints,
      totalChargeTime,
      avgChargeTime,
      totalMiningPower,
      avgMiningPower,
      totalNftPower,
      avgNftPower,
      landsMinedOn,
      planetsMinedOn,
      uniqueToolsUsed,
      rankings,
      planets,
      lands,
    } = this;

    const struct: LeaderboardJson = {
      last_update_timestamp: lastUpdateTimestamp.toISOString(),
      last_update_id: lastUpdateId,
      last_block_number: lastBlockNumber.toString(),
      last_block_timestamp: lastBlockTimestamp.toISOString(),
      username,
      wallet_id: walletId,
      tlm_gains_total: tlmGainsTotal,
      tlm_gains_highest: tlmGainsHighest,
      total_nft_points: totalNftPoints,
      total_charge_time: totalChargeTime,
      avg_charge_time: avgChargeTime,
      total_mining_power: totalMiningPower,
      avg_mining_power: avgMiningPower,
      total_nft_power: totalNftPower,
      avg_nft_power: avgNftPower,
      lands_mined_on: landsMinedOn,
      planets_mined_on: planetsMinedOn,
      unique_tools_used: uniqueToolsUsed,
      planets,
      lands: lands.map(land => land.toString()),
    };

    if (rankings.size > 0) {
      struct.rankings = {};
      rankings.forEach((value, key) => {
        struct.rankings[key] = value;
      });
    }

    return removeUndefinedProperties<LeaderboardJson>(struct);
  }
}