import { AtomicAssetsConfig } from '@alien-worlds/alienworlds-api-common';
import { Container, MongoSource } from '@alien-worlds/api-core';
import { AtomicAssetRepository } from './domain/repositories/atomic-asset.repository';
import { buildAtomicAssetsApiUrl } from './utils';
import { AtomicAssetRepositoryImpl } from './data/repositories/atomic-assets.repository-impl';
import { AtomicAssetsApiSource } from './data/data-sources/atomic-assets.api.source';
import { AtomicAssetsMongoSource } from './data/data-sources/atomic-assets.mongo.source';
import { AtomicAssetMapper } from './data/mappers/atomic-asset.mapper';
import { GetAtomicAssetsUseCase } from './domain/use-cases/get-atomic-assets.use-case';
import { AtomicAssetsServiceImpl } from './data/services/atomic-assets.service-impl';
import { AtomicAssetsService } from './domain/services/atomic-assets.service';

export const setupAtomicAssets = async (
  config: AtomicAssetsConfig,
  mongo?: MongoSource,
  container?: Container
): Promise<void> => {
  let mongoSource: MongoSource;

  if (mongo instanceof MongoSource) {
    mongoSource = mongo;
  } else {
    mongoSource = await MongoSource.create(config.mongo);
  }
  const repository = new AtomicAssetRepositoryImpl(
    new AtomicAssetsApiSource(
      buildAtomicAssetsApiUrl(config.api),
      config.api.maxAssetsPerRequest || 10
    ),
    new AtomicAssetsMongoSource(mongoSource),
    new AtomicAssetMapper()
  );

  const serviceImpl = new AtomicAssetsServiceImpl(repository, config.api);

  if (container) {
    container
      .bind<AtomicAssetRepository>(AtomicAssetRepository.Token)
      .toConstantValue(repository);
    container
      .bind<AtomicAssetsService>(AtomicAssetsService.Token)
      .toConstantValue(serviceImpl);
    container
      .bind<GetAtomicAssetsUseCase>(GetAtomicAssetsUseCase.Token)
      .to(GetAtomicAssetsUseCase);
  }
};
