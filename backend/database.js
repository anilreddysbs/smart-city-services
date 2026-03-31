import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DB_URL ||
  '';

const poolOptions = connectionString
  ? {
    connectionString,
    ssl: { rejectUnauthorized: false }
  }
  : {
    host: process.env.DB_HOST || process.env.POSTGRES_HOST || 'localhost',
    user: process.env.DB_USER || process.env.POSTGRES_USER || 'postgres',
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || '',
    database: process.env.DB_NAME || process.env.POSTGRES_DATABASE || 'smart_city_services',
    port: Number(process.env.DB_PORT || 5432),
    ssl: { rejectUnauthorized: false }
  };

const pool = new Pool(poolOptions);

export default pool;
