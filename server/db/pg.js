import pgPromise from "pg-promise";
import { configDotenv } from "dotenv";
configDotenv();

const pgp = pgPromise();
const cn = {
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
};
export const db = pgp(cn);
