const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsedValue = Number.parseInt(value ?? '', 10);

  return Number.isNaN(parsedValue) ? fallback : parsedValue;
};

export interface DatabaseEnvironment {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface JwtEnvironment {
  secret: string;
  expiresIn: string;
}

export interface AppEnvironment {
  port: number;
  nodeEnv: string;
  frontendUrl: string;
  database: DatabaseEnvironment;
  jwt: JwtEnvironment;
}

export const resolveEnvironment = (
  env: NodeJS.ProcessEnv = process.env,
): AppEnvironment => ({
  port: parseNumber(env.PORT, 3000),
  nodeEnv: env.NODE_ENV ?? 'development',
  frontendUrl: env.FRONTEND_URL ?? 'http://localhost:5173',
  database: {
    host: env.DB_HOST ?? 'localhost',
    port: parseNumber(env.DB_PORT, 5432),
    username: env.DB_USERNAME ?? 'postgres',
    password: env.DB_PASSWORD ?? '',
    database: env.DB_DATABASE ?? 'noir_blanc',
  },
  jwt: {
    secret: env.JWT_SECRET ?? 'noir_blanc_secret_dev',
    expiresIn: env.JWT_EXPIRES_IN ?? '1d',
  },
});

export default (): AppEnvironment => resolveEnvironment();
