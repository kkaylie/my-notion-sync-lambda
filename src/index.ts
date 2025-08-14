import { getUpdatedPublishedPosts } from './notionAPIs'
import { savePostsToDatabase } from './database'
import { getSyncTimestamp, saveSyncTimestamp } from './syncTimestamp'

export const handler = async (event: any) => {
  try {
    const lastSyncTime = await getSyncTimestamp()
    const updatedPosts = await getUpdatedPublishedPosts(lastSyncTime)

    if (updatedPosts.length === 0) {
      console.log('No new posts to sync.')
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No new posts to sync.' })
      }
    }

    console.log(`Found ${updatedPosts.length} posts to sync.`)
    console.log(updatedPosts.map((p) => p.title))

    await savePostsToDatabase(updatedPosts)

    console.log('Sync process completed successfully.')

    await saveSyncTimestamp(new Date().toISOString())

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Sync successful!' })
    }
  } catch (error) {
    console.error('Error during Notion sync:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error during sync.' })
    }
  }
}
