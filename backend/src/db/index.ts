import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const connectionUri = process.env.DATABASE_URL;

if (!connectionUri) {
  console.warn('Warning: DATABASE_URL environment variable is not defined.');
}

export const pool = connectionUri
  ? new pg.Pool({ connectionString: connectionUri })
  : null;

export const db = pool
  ? drizzle(pool, { schema })
  : null;
