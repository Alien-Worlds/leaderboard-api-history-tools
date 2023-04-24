import { removeUndefinedProperties, MongoDB } from '@alien-worlds/api-core';
import {
  BackedTokenDocument,
  BackedTokenStruct,
} from '../../data/dtos/atomic-assets.dto';

/*imports*/
/**
 *
 * @class
 */
export class BackedToken {
  public static fromStruct(dto: BackedTokenStruct): BackedToken {
    const { token_contract, token_symbol, token_precision, amount, ...rest } =
      dto;
    return new BackedToken(
      token_contract,
      token_symbol,
      token_precision,
      amount,
      rest
    );
  }

  public static fromDocument(dto: BackedTokenDocument): BackedToken {
    const { token_contract, token_symbol, token_precision, amount, ...rest } =
      dto;
    return new BackedToken(
      token_contract,
      token_symbol,
      token_precision,
      amount,
      rest
    );
  }

  /**
   * @private
   * @constructor
   */
  private constructor(
    public readonly tokenContract: string,
    public readonly tokenSymbol: string,
    public readonly tokenPrecision: number,
    public readonly amount: string,
    public readonly rest: object
  ) {}

  public toDocument(): BackedTokenDocument {
    const { tokenContract, tokenSymbol, tokenPrecision, amount, rest } = this;

    const document: BackedTokenDocument = {
      token_contract: tokenContract,
      token_symbol: tokenSymbol,
      token_precision: tokenPrecision,
      amount,
      ...rest,
    };

    return removeUndefinedProperties<BackedTokenDocument>(document);
  }

  /*methods*/
}
