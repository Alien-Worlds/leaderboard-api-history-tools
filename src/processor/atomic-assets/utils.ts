import { AtomicAssetsApiConfig } from "@alien-worlds/alienworlds-api-common";

export const buildAtomicAssetsApiUrl = (
  config: AtomicAssetsApiConfig
): string => {
  const { host, port, secure } = config;

  return `${secure ? 'https' : 'http'}://${host}${port ? ':' + port : ''}`;
};
