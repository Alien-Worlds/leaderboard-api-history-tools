import { MongoDB } from "@alien-worlds/api-core";

export type LeaderboardUpdateStruct = {
  wallet_id: string;
  username?: string;
  bounty?: string | number;
  block_number?: string;
  block_timestamp?: string;
  points?: number | string;
  land_id?: string;
  planet_name?: string;
  bag_items?: string[];
  update_id?: string;
  [key: string]: unknown;
};

export type LeaderboardUpdateDocument = {
  wallet_id: string;
  block_number: MongoDB.Long;
  block_timestamp: Date;
  username?: string;
  bounty?: number;
  points?: number;
  land_id?: MongoDB.Long;
  planet_name?: string;
  bag_items?: MongoDB.Long[];
  update_id?: string;
  _id?: MongoDB.ObjectId;
  [key: string]: unknown;
};

export type LeaderboardNumbers = {
  tlm_gains_total?: number;
  total_nft_points?: number;
  unique_tools_used?: number;
  avg_charge_time?: number;
  avg_mining_power?: number;
  avg_nft_power?: number;
  lands_mined_on?: number;
  planets_mined_on?: number;
};

export type LeaderboardDocument = LeaderboardNumbers & {
  _id?: MongoDB.ObjectId;
  start_timestamp?: Date;
  end_timestamp?: Date;
  last_update_timestamp?: Date;
  last_update_id?: string;
  wallet_id?: string;
  username?: string;
  tlm_gains_highest?: number;
  tools_used?: MongoDB.Long[];
  total_charge_time?: number;
  total_mining_power?: number;
  total_nft_power?: number;
  lands?: MongoDB.Long[];
  planets?: string[];
  rankings?: LeaderboardNumbers;
  [key: string]: unknown;
};

export type MinigToolData = {
  delay: number;
  ease: number;
  difficulty: number;
};

export type LeaderboardStruct = LeaderboardNumbers & {
  start_timestamp?: string;
  end_timestamp?: string;
  last_update_timestamp?: string;
  last_update_hash?: string;
  last_update_completed?: boolean;
  wallet_id?: string;
  username?: string;
  tlm_gains_highest?: number;
  tools_used?: string[];
  total_charge_time?: number;
  total_mining_power?: number;
  total_nft_power?: number;
  lands?: string[];
  planets?: string[];
  rankings?: LeaderboardNumbers;
  [key: string]: unknown;
};

export type LeaderboardUserRankingsStruct = { [key: string]: LeaderboardNumbers };
export type LeaderboardUserScoresStruct = { [key: string]: LeaderboardNumbers };