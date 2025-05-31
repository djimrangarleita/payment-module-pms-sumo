import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Database configuration interface
interface DatabaseConfig {
  server: string;
  database: string;
  user: string;
  password: string;
  port: number;
}

// Validate required environment variables
const requiredEnvVars = [
  'DB_SERVER',
  'DB_DATABASE',
  'DB_USER',
  'DB_PASSWORD',
  'MSSQL_PORT'
] as const;

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Export the database configuration
export const config: DatabaseConfig = {
  server: process.env.DB_SERVER!,
  database: process.env.DB_DATABASE!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  port: parseInt(process.env.MSSQL_PORT!, 10),
}; 