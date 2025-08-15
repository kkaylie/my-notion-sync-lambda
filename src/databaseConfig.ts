import { Pool } from 'pg'
import path from 'path'
import fs from 'fs'

const POSTGRESQL_CONFIG = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
}

const caPath = path.resolve(
  __dirname,
  '..',
  `${process.env.AWS_REGION}-bundle.pem`
)

export function getPool() {
  if (
    !POSTGRESQL_CONFIG.user ||
    !POSTGRESQL_CONFIG.host ||
    !POSTGRESQL_CONFIG.database ||
    !POSTGRESQL_CONFIG.password
  ) {
    throw new Error(
      'PostgreSQL configuration is incomplete. Please check your environment variables.'
    )
  }
  if (!fs.existsSync(caPath)) {
    throw new Error(
      `CA certificate file not found at path: ${caPath}. Please ensure the file exists.`
    )
  }
  const caCertificate = fs.readFileSync(caPath).toString()
  // --- PostgreSQL config ---
  const pool = new Pool({
    ...POSTGRESQL_CONFIG,
    ssl: {
      ca: caCertificate,
    },
  })
  return pool
}
