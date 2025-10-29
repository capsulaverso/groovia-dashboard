import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL || 
  'postgresql://authenticator:npg_M6Wqf5cFoSRe@ep-bold-poetry-a4sbv5mh-pooler.us-east-1.aws.neon.tech/capsula?sslmode=require';

export default defineConfig({
  dialect: 'postgresql',
  schema: './shared/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: databaseUrl,
  },
});
