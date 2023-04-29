import { LeaderboardUpdateRepositoryImpl } from './data/repositories/leaderboard-update.repository-impl';
import { Container, MongoSource, RedisSource } from '@alien-worlds/api-core';
import { LeaderboardUpdateRepository } from './domain/repositories/leaderboard-update.repository';
import { LeaderboardRepositoryImpl } from './data/repositories/leaderboard.repository-impl';
import { LeaderboardUpdateMongoSource } from './data/data-sources/leaderboard-update.mongo.source';
import { LeaderboardRedisSource } from './data/data-sources/leaderboard.redis.source';
import { ExtendedLeaderboardConfig } from '../../config';
import { LeaderboardArchiveMongoSource } from './data/data-sources/leaderboard.mongo.source';
import { DailyLeaderboardRepository } from './domain/repositories/daily-leaderboard.repository';
import { WeeklyLeaderboardRepository } from './domain/repositories/weekly-leaderboard.repository';
import { MonthlyLeaderboardRepository } from './domain/repositories/monthly-leaderboard.repository';
import { CreateUserLeaderboardUseCase } from './domain/use-cases/create-user-leaderboard.use-case';
import { UpdateLeaderboardWithinTimeframeUseCase } from './domain/use-cases/update-leaderboard-within-timeframe.use-case';
import { UpdateLeaderboardUseCase } from './domain/use-cases/update-leaderboard.use-case';
import { UpdateUserLeaderboardUseCase } from './domain/use-cases/update-user-leaderboard.use-case';
import { LeaderboardSnapshotMongoSource } from './data/data-sources/leaderboard-snapshot.mongo.source';

export const setupLeaderboard = async (
  config: ExtendedLeaderboardConfig,
  mongo?: MongoSource,
  container?: Container
): Promise<void> => {
  let mongoSource: MongoSource;

  if (mongo instanceof MongoSource) {
    mongoSource = mongo;
  } else {
    mongoSource = await MongoSource.create(config.mongo);
  }

  const redisSource = await RedisSource.create(config.redis);

  const leaderboardUpdateRepository = new LeaderboardUpdateRepositoryImpl(
    new LeaderboardUpdateMongoSource(mongoSource)
  );

  const dailyLeaderboardRepository = new LeaderboardRepositoryImpl(
    new LeaderboardArchiveMongoSource(mongoSource, 'daily'),
    new LeaderboardSnapshotMongoSource(mongoSource, 'daily'),
    new LeaderboardRedisSource(redisSource, 'daily'),
    config.archiveBatchSize
  );

  const weeklyLeaderboardRepository = new LeaderboardRepositoryImpl(
    new LeaderboardArchiveMongoSource(mongoSource, 'weekly'),
    new LeaderboardSnapshotMongoSource(mongoSource, 'weekly'),
    new LeaderboardRedisSource(redisSource, 'weekly'),
    config.archiveBatchSize
  );

  const monthlyLeaderboardRepository = new LeaderboardRepositoryImpl(
    new LeaderboardArchiveMongoSource(mongoSource, 'monthly'),
    new LeaderboardSnapshotMongoSource(mongoSource, 'monthly'),
    new LeaderboardRedisSource(redisSource, 'monthly'),
    config.archiveBatchSize
  );

  if (container) {
    container
      .bind<LeaderboardUpdateRepository>(LeaderboardUpdateRepository.Token)
      .toConstantValue(leaderboardUpdateRepository);
    container
      .bind<DailyLeaderboardRepository>(DailyLeaderboardRepository.Token)
      .toConstantValue(dailyLeaderboardRepository);
    container
      .bind<WeeklyLeaderboardRepository>(WeeklyLeaderboardRepository.Token)
      .toConstantValue(weeklyLeaderboardRepository);
    container
      .bind<MonthlyLeaderboardRepository>(MonthlyLeaderboardRepository.Token)
      .toConstantValue(monthlyLeaderboardRepository);
    container
      .bind<CreateUserLeaderboardUseCase>(CreateUserLeaderboardUseCase.Token)
      .to(CreateUserLeaderboardUseCase);
    container
      .bind<UpdateLeaderboardWithinTimeframeUseCase>(
        UpdateLeaderboardWithinTimeframeUseCase.Token
      )
      .to(UpdateLeaderboardWithinTimeframeUseCase);
    container
      .bind<UpdateLeaderboardUseCase>(UpdateLeaderboardUseCase.Token)
      .to(UpdateLeaderboardUseCase);
    container
      .bind<UpdateUserLeaderboardUseCase>(UpdateUserLeaderboardUseCase.Token)
      .to(UpdateUserLeaderboardUseCase);
  }
};
