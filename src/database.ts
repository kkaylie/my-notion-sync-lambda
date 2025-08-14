import { Pool } from 'pg'
import path from 'path'
import fs from 'fs'
// import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
// import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import type { PostContent } from './types/notion'

const POSTGRESQL_CONFIG = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
}
const caPath = path.resolve(__dirname, '..', 'us-east-1-bundle.pem')

function getPool() {
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

// --- DynamoDB config ---
// const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION })
// const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
// const interactionsTableName = process.env.DYNAMODB_INTERACTIONS_TABLE!

/**
 * insert or update a Post in PostgreSQL database
 * @param post - PostContent object containing post details
 */
async function upsertPostToPostgres(post: PostContent) {
  const pool = getPool()
  if (!pool) {
    throw new Error('Database connection pool is not initialized.')
  }

  const client = await pool.connect()
  if (!client) {
    throw new Error('Failed to acquire a database connection.')
  }

  try {
    const existingPost = await client.query(
      'SELECT id FROM posts WHERE id = $1',
      [post.id]
    )

    if (existingPost.rows.length > 0) {
      // Post exists, execute UPDATE
      console.log(`Updating post: ${post.title}`)
      const query = `
        UPDATE posts 
        SET title = $1, slug = $2, summary = $3, published_date = $4, is_pinned = $5, tags = $6, cover = $7, icon = $8, markdown = $9, updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
      `
      await client.query(query, [
        post.title,
        post.slug,
        post.summary,
        post.publishedDate,
        post.isPinned,
        post.tags,
        post.cover,
        post.icon,
        post.markdown,
        post.id,
      ])
    } else {
      // Post does not exist, execute INSERT
      console.log(`Inserting new post: ${post.title}`)
      console.log(post)
      const query = `
        INSERT INTO posts (id, title, slug, summary, published_date, is_pinned, tags, cover, icon, markdown)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `
      await client.query(query, [
        post.id,
        post.title,
        post.slug,
        post.summary,
        post.publishedDate,
        post.isPinned,
        post.tags,
        post.cover,
        post.icon,
        post.markdown,
      ])
    }
  } finally {
    client.release()
  }
}

// /**
//  * Updates or inserts interaction data for a post in DynamoDB
//  * @param postId - The ID of the post
//  */
// async function upsertPostInteractionData(postId: string) {
//   const command = new UpdateCommand({
//     TableName: interactionsTableName,
//     Key: { id: postId },
//     UpdateExpression: 'SET #views = if_not_exists(#views, :zero), #likes = if_not_exists(#likes, :zero)',
//     ExpressionAttributeNames: {
//       '#views': 'views',
//       '#likes': 'likes',
//     },
//     ExpressionAttributeValues: {
//       ':zero': 0,
//     },
//   })
//   await ddbDocClient.send(command)
// }

/**
 * Saves an array of PostContent objects to the PostgreSQL database.
 * @param posts - An array of PostContent objects to be saved.
 */
export async function savePostsToDatabase(posts: PostContent[]) {
  const allPromises = posts.map((post) =>
    Promise.all([
      upsertPostToPostgres(post),
      // upsertPostInteractionData(post.id)
    ])
  )

  await Promise.all(allPromises)
  console.log(`Successfully synced ${posts.length} posts to the databases.`)
}
