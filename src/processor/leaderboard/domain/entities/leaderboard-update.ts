import { nanoid } from 'nanoid';
import {
  removeUndefinedProperties,
  MongoDB,
  parseToBigInt,
} from '@alien-worlds/api-core';
import {
  FederationContract,
  NotifyWorldContract,
  UsptsWorldsContract,
} from '@alien-worlds/alienworlds-api-common';
import { LeaderboardUpdateDocument } from '../../data/leaderboard.dtos';

/**
 * @class
 */
export class LeaderboardUpdate {
  public static fromDocument(document: LeaderboardUpdateDocument): LeaderboardUpdate {
    const {
      _id,
      wallet_id,
      username,
      bounty,
      block_number,
      block_timestamp,
      points,
      land_id,
      planet_name,
      bag_items,
      update_id,
    } = document;

    return new LeaderboardUpdate(
      parseToBigInt(block_number),
      block_timestamp,
      wallet_id,
      username,
      bounty,
      points,
      land_id ? parseToBigInt(land_id) : null,
      planet_name,
      bag_items ? bag_items.map(parseToBigInt) : null,
      update_id,
      _id instanceof MongoDB.ObjectId ? _id.toString() : null
    );
  }

  public static fromLogmineJson(
    blockNumber: string | number | bigint,
    blockTimestamp: Date,
    json: NotifyWorldContract.Actions.Types.LogmineStruct
  ): LeaderboardUpdate {
    const { miner, bounty, land_id, planet_name, bag_items } = json;
    return new LeaderboardUpdate(
      parseToBigInt(blockNumber),
      blockTimestamp,
      miner,
      '',
      Number(bounty),
      0,
      parseToBigInt(land_id),
      planet_name,
      bag_items.map(parseToBigInt),
      nanoid()
    );
  }

  public static fromAddPointsJson(
    blockNumber: string | number | bigint,
    blockTimestamp: Date,
    json: UsptsWorldsContract.Actions.Types.AddpointsStruct
  ): LeaderboardUpdate {
    const { user, points } = json;
    return new LeaderboardUpdate(
      parseToBigInt(blockNumber),
      blockTimestamp,
      user,
      '',
      0,
      points,
      0n,
      '',
      [],
      nanoid()
    );
  }

  public static fromSetTagJson(
    blockNumber: string | number | bigint,
    blockTimestamp: Date,
    json: FederationContract.Actions.Types.SettagStruct
  ): LeaderboardUpdate {
    const { tag, account } = json;
    return new LeaderboardUpdate(
      parseToBigInt(blockNumber),
      blockTimestamp,
      account,
      tag,
      0,
      0,
      0n,
      '',
      [],
      nanoid()
    );
  }

  /**
   * @constructor
   */
  protected constructor(
    public readonly blockNumber: bigint,
    public readonly blockTimestamp: Date,
    public readonly walletId: string,
    public readonly username: string,
    public readonly bounty: number,
    public readonly points: number,
    public readonly landId: bigint,
    public readonly planetName: string,
    public readonly bagItems: bigint[],
    public readonly updateId: string,
    public readonly id?: string
  ) {}

  /**
   *
   * @returns {LeaderboardUpdateDocument}
   */
  public toDocument(): LeaderboardUpdateDocument {
    const {
      id,
      walletId,
      username,
      bounty,
      blockNumber,
      blockTimestamp,
      points,
      landId,
      planetName,
      bagItems: tools,
      updateId: update_id,
    } = this;

    const document: LeaderboardUpdateDocument = {
      block_number: MongoDB.Long.fromBigInt(blockNumber),
      block_timestamp: blockTimestamp,
      username,
      wallet_id: walletId,
      bounty,
      points,
      planet_name: planetName,
      update_id,
    };

    if (landId) {
      document.land_id = MongoDB.Long.fromBigInt(landId);
    }

    if (tools) {
      document.tools = tools.map(tool => MongoDB.Long.fromBigInt(tool));
    }

    if (id && MongoDB.ObjectId.isValid(id)) {
      document._id = new MongoDB.ObjectId(id);
    }

    return removeUndefinedProperties<LeaderboardUpdateDocument>(document);
  }
}
