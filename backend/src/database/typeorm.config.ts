import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import {
  type DatabaseEnvironment,
  resolveEnvironment,
} from '../config/env.configuration';

const buildDataSourceOptions = (
  databaseConfig: DatabaseEnvironment,
): DataSourceOptions => ({
  type: 'postgres',
  host: databaseConfig.host,
  port: databaseConfig.port,
  username: databaseConfig.username,
  password: databaseConfig.password,
  database: databaseConfig.database,
  synchronize: false,
  migrationsRun: true,
  entities: [join(__dirname, '..', 'modules', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
});

export const getTypeOrmModuleOptions = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  ...buildDataSourceOptions({
    host: configService.getOrThrow<string>('database.host'),
    port: configService.getOrThrow<number>('database.port'),
    username: configService.getOrThrow<string>('database.username'),
    password: configService.get<string>('database.password') ?? '',
    database: configService.getOrThrow<string>('database.database'),
  }),
  autoLoadEntities: true,
});

export const getDataSourceOptions = (): DataSourceOptions => {
  const { database } = resolveEnvironment();

  return buildDataSourceOptions(database);
};
