import { DataSource } from 'typeorm';
import { loadEnvironmentFiles } from '../config/env-files';
import { getDataSourceOptions } from './typeorm.config';

loadEnvironmentFiles();

export default new DataSource(getDataSourceOptions());
