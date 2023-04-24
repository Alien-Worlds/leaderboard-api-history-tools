import { log } from '@alien-worlds/api-core';
import fetch from 'node-fetch';
import { AtomicAssetStruct } from '../dtos/atomic-assets.dto';
/*imports*/

export class AtomicAssetsApiSource {
  constructor(
    private readonly url: string,
    private maxAssetsPerRequest: number
  ) {}

  private async fetchData<DataType = unknown>(
    path: string,
    returnArray?: boolean
  ): Promise<DataType> {
    try {
      const response = await fetch(new URL(path, this.url));
      const json = await response.json();
      if (response.ok && json.data) {
        return json.data;
      }

      return returnArray ? <DataType>[] : null;
    } catch (error) {
      log(error);
      return returnArray ? <DataType>[] : null;
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

  public async fetchOne(assetId: string): Promise<AtomicAssetStruct> {
    return this.fetchData<AtomicAssetStruct>(
      `/atomicassets/v1/assets/${assetId.toString()}`
    );
  }

  public async fetchMany(
    assetIds: (string | number | bigint)[]
  ): Promise<AtomicAssetStruct[]> {
    try {
      const chunks = this.splitToChunks(assetIds);
      const result = [];

      for (const chunk of chunks) {
        const assets = await this.fetchData<AtomicAssetStruct[]>(
          `/atomicassets/v1/assets?ids=${chunk.join(',')}`,
          true
        );
        result.push(...assets);
      }

      return result;
    } catch (error) {
      log(error);
      return [];
    }
  }
}
