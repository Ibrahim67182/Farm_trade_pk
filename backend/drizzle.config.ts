import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';

// Make sure environment variables are loaded
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('MYSQL_URL environment variable is not set');
}

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Additional options to improve stability
  verbose: true,
  strict: true,
} satisfies Config;

