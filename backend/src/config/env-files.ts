import { config as loadDotenv } from 'dotenv';

export const getEnvFilePaths = (
  nodeEnv: string | undefined = process.env.NODE_ENV,
): string[] => {
  const normalizedNodeEnv = nodeEnv?.trim().toLowerCase();

  if (normalizedNodeEnv === 'production') {
    return ['.env.prod', '.env.production', '.env'];
  }

  if (normalizedNodeEnv === 'test') {
    return ['.env.test', '.env'];
  }

  return ['.env.dev', '.env.development', '.env'];
};

export const loadEnvironmentFiles = (
  nodeEnv: string | undefined = process.env.NODE_ENV,
): void => {
  for (const path of getEnvFilePaths(nodeEnv)) {
    loadDotenv({ path, override: false });
  }
};
