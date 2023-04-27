import { log, parseToBigInt } from '@alien-worlds/api-core';
import fetch from 'node-fetch';
import { AtomicAssetStruct } from '../dtos/atomic-assets.dto';
/*imports*/

export class AtomicAssetsApiRateLimitError extends Error {
  constructor() {
    super('Too many requests.');
  }
}

export class AtomicAssetsApiResponse {
  constructor(
    public readonly assets: {
      content: AtomicAssetStruct[];
      failed?: bigint[];
      error?: Error;
    }
  ) {}
}

export class AtomicAssetsApiSource {
  constructor(private readonly url: string, private maxAssetsPerRequest: number) {}

  private async fetchData<DataType>(path: string): Promise<DataType[] | Error> {
    try {
      const response = await fetch(new URL(path, this.url));

      if (response.status === 429) {
        return new AtomicAssetsApiRateLimitError();
      }

      if (response.ok) {
        const json = await response.json();
        if (json.data) {
          return Array.isArray(json.data) ? json.data : [json.data];
        }
      }

      return [];
    } catch (error) {
      log(error);
      return error;
    }
  }

  private splitToChunks(assetIds: (string | number | bigint)[]) {
    const { maxAssetsPerRequest } = this;
    const chunks = [];
    for (let i = 0; i < assetIds.length; i += maxAssetsPerRequest) {
      const chunk = assetIds.slice(i, i + maxAssetsPerRequest);
      chunks.push(chunk);
    }

    return chunks;
  }

  public async fetchOne(assetId: string): Promise<AtomicAssetsApiResponse> {
    let error;
    const content = [];
    const failed = [];
    const result = await this.fetchData<AtomicAssetStruct>(
      `/atomicassets/v1/assets/${assetId.toString()}`
    );

    if (result instanceof Error) {
      error = result;
      failed.push(assetId);
    } else {
      content.push(result);
    }

    return new AtomicAssetsApiResponse({ content, error, failed });
  }

  public async fetchMany(
    assetIds: (string | number | bigint)[]
  ): Promise<AtomicAssetsApiResponse> {
    try {
      const chunks = this.splitToChunks(assetIds);
      const content = [];
      const failed: bigint[] = [];
      let error;

      while (chunks.length > 0) {
        const chunk = chunks.shift();
        const result = await this.fetchData<AtomicAssetStruct[]>(
          `/atomicassets/v1/assets?ids=${chunk.join(',')}`
        );

        if (result instanceof Error) {
          failed.push(...chunk);
        }

        if (result instanceof AtomicAssetsApiRateLimitError) {
          error = result;
          failed.push(
            ...chunks.reduce((list, chunk) => {
              list.push(...chunk);
              return list;
            }, [])
          );
          break;
        }

        if (Array.isArray(result)) {
          content.push(...result);
        }
      }

      return new AtomicAssetsApiResponse({ content, failed, error });
    } catch (error) {
      log(error);
      return new AtomicAssetsApiResponse({
        content: [],
        failed: assetIds.map(parseToBigInt),
        error,
      });
    }
  }
}
