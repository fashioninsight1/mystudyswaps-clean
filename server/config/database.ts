import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from '../../shared/schema.js';

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not set, using mock database');
  // Create mock database for development
  export const db = {
    select: () => ({
      from: () => ({
        where: () => []
      })
    }),
    insert: () => ({
      values: () => ({
        returning: () => [{ id: 'mock-id' }]
      })
    })
  };
} else {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  export const db = drizzle({ client: pool, schema });
}
