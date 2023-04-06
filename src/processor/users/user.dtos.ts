import { MongoDB } from '@alien-worlds/api-core';

export type UserStruct = {
  wallet_id: string;
  username: string;
  total_points: number;
  [key: string]: unknown;
};

export type UserDocument = UserStruct & {
  _id?: MongoDB.ObjectId;
};
