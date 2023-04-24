export class AssetNotFoundError extends Error {
  constructor(id: string | number | bigint) {
    super(`Asset: ${id.toString()} not found.`);
  }
}
