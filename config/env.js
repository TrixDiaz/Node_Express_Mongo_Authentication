import {config} from "dotenv";

config({path: `.env.${process.env.NODE_ENV || "development"}.local`});

export const {
  PORT,
  SERVER_URL,
  NODE_ENV,
  DB_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
  ARCJET_KEY,
  ARCJET_ENV,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASSWORD,
} = process.env;
