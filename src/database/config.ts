import {Client} from 'pg';
import 'dotenv/config'

export const cliente: Client = new Client({
  user:process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host:process.env.DB_HOST,
  database: process.env.DB,
  port:parseInt(process.env.DB_PORT!)
})
