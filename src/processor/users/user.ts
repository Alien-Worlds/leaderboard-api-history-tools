import { MongoDB, removeUndefinedProperties } from '@alien-worlds/api-core';
import { UserDocument, UserStruct } from './user.dtos';

export class User {
  public static fromStruct(struct: UserStruct): User {
    const { wallet_id, username, total_points } = struct;
    return new User(wallet_id, username, total_points);
  }

  public static fromDocument(document: UserDocument): User {
    const { wallet_id, username, total_points } = document;
    return new User(wallet_id, username, total_points);
  }

  public static create(walletId: string, username?: string, total_points?: number): User {
    return new User(walletId, username, total_points);
  }

  private constructor(
    public readonly walletId: string,
    public readonly username: string,
    public readonly totalPoints: number,
    public readonly id?: string
  ) {}

  public toDocument(): UserDocument {
    const { walletId: wallet_id, username, totalPoints: total_points, id } = this;

    const document: UserDocument = {
      wallet_id,
      total_points,
      username,
    };

    if (id) {
      document._id = new MongoDB.ObjectId(id);
    }

    return removeUndefinedProperties<UserDocument>(document);
  }

  public toStruct(): UserStruct {
    const { walletId: wallet_id, username, totalPoints: total_points } = this;

    const struct: UserStruct = {
      wallet_id,
      total_points,
      username,
    };

    return removeUndefinedProperties<UserStruct>(struct);
  }
}
