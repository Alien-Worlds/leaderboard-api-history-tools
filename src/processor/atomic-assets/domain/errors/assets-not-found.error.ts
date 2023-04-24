export class AssetsNotFoundError extends Error {
  constructor(public readonly ids: (string | number | bigint)[]) {
    super(`Assets: ${ids.join(', ')} not found.`);
  }
}
