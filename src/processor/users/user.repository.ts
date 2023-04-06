/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Result,
  MongoSource,
  MongoDB,
  Failure,
  DataSourceOperationError,
} from '@alien-worlds/api-core';
import { User } from './user';
import { UserDocument } from './user.dtos';

export class UserRepository {
  private collection: MongoDB.Collection<UserDocument>;
  constructor(mongoSource: MongoSource) {
    this.collection = mongoSource.database.collection('leaderboard_users');
  }

  public async update(users: User[]): Promise<Result> {
    try {
      const documents = users.map(user => user.toDocument());
      const operations = documents.map(dto => {
        const { _id, ...documentWithoutId } = dto;
        const { wallet_id } = documentWithoutId;
        return {
          updateOne: {
            filter: { wallet_id },
            update: {
              $set: documentWithoutId as MongoDB.MatchKeysAndValues<UserDocument>,
            },
            upsert: true,
          },
        };
      });
      await this.collection.bulkWrite(operations);
      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(
        Failure.fromError(DataSourceOperationError.fromError(error))
      );
    }
  }

  public async list(walletIds?: string[]): Promise<Result<User[]>> {
    try {
      let filter = {};
      if (Array.isArray(walletIds) && walletIds.length > 0) {
        filter = { wallet_id: { $in: walletIds } };
      }
      const documents = await (await this.collection.find(filter)).toArray();

      return Result.withContent(documents.map(User.fromDocument));
    } catch (error) {
      return Result.withFailure(
        Failure.fromError(DataSourceOperationError.fromError(error))
      );
    }
  }
}
