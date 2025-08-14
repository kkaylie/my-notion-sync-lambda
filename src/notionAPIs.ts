import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'

import { sortPostsByPinned } from './notionHelpers'

import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

const notion = new Client({
  auth: process.env.NOTION_API_KEY
})
const n2m = new NotionToMarkdown({ notionClient: notion })

const databaseId = process.env.NOTION_DATABASE_ID!

/**
 * Fetches posts that have been updated since the given timestamp.
 * @param lastSyncTime ISO string representing the last sync time.
 * @returns An array of BlogPost objects that have been updated since lastSyncTime.
 */
export const getUpdatedPublishedPosts = async (sinceISOString: string) => {
  console.log(`Fetching posts updated since: ${sinceISOString}`)
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      and: [
        {
          property: 'Status',
          status: {
            equals: 'Published'
          }
        },
        {
          timestamp: 'last_edited_time',
          last_edited_time: {
            on_or_after: sinceISOString
          }
        }
      ]
    },
    sorts: [
      {
        property: 'PublishedDate',
        direction: 'descending'
      }
    ]
  })

  const pageResults = response.results.filter(
    (page): page is PageObjectResponse => page.object === 'page'
  )
  const postsList = sortPostsByPinned(pageResults)

  // For each updated page, fetch its full content.
  const postsWithContent = await Promise.all(
    postsList.map(async (post) => {
      const mdBlocks = await n2m.pageToMarkdown(post.id)
      const mdString = n2m.toMarkdownString(mdBlocks).parent
      return {
        ...post,
        markdown: mdString
      }
    })
  )

  return postsWithContent
}
