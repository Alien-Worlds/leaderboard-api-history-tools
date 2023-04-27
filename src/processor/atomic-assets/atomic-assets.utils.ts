export const splitToChunks = <T = unknown>(items: T[], chunkSize: number) => {
  const chunks = [];
  items = [].concat(...items);

  while (items.length) {
    chunks.push(items.splice(0, chunkSize));
  }

  return chunks;
};

export const arrayDiff = <T = unknown>(array1: T[], array2: T[]): T[] => {
  return array1.filter(item => !array2.includes(item));
};
