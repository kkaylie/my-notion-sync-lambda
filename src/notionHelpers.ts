import type { PagePropertyValue, BlogPost, NotionMedia } from './types/notion'

import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

// Type-safe function to extract values from different property types
export function getPropertyValue(prop: PagePropertyValue) {
  // Use the 'type' field as a discriminant to safely access data
  if (!prop) {
    return ''
  }
  switch (prop.type) {
    case 'title':
      return prop.title[0]?.plain_text ?? ''
    case 'rich_text':
      return prop.rich_text[0]?.plain_text ?? ''
    case 'date':
      return prop.date?.start ?? ''
    case 'last_edited_time':
      return prop.last_edited_time
    case 'multi_select':
      return prop.multi_select.map((item) => item.name)
    case 'select':
      return prop.select?.name ?? ''
    // case 'number':
    //   return prop.number?.toString() ?? '';
    // case 'checkbox':
    //   return prop.checkbox ? 'true' : 'false';
    default:
      return ''
  }
}

function getFlagValues(prop: PageObjectResponse['properties']) {
  const flag = getPropertyValue(prop.Flag)
  return {
    isPinned: flag === 'Pinned',
  }
}

export function pageToPost(page: PageObjectResponse): BlogPost {
  const props = page.properties
  console.log('page properties:', props)

  return {
    id: page.id,
    title: (getPropertyValue(props.Title) as string) ?? 'Untitled',
    slug: (getPropertyValue(props.Slug) as string) ?? '',
    icon: getMediaUrl(page.icon),
    cover: getMediaUrl(page.cover),
    publishedDate: (getPropertyValue(props.PublishedDate) as string) ?? '',
    updatedDate: (getPropertyValue(props.UpdatedDate) as string) ?? '',
    summary: (getPropertyValue(props.Summary) as string) ?? '',
    tags: (getPropertyValue(props.Tags) as string[]) ?? [],
    ...getFlagValues(props),
  }
}

export function sortPostsByPinned(posts: PageObjectResponse[]): BlogPost[] {
  return posts.map(pageToPost).sort((a, b) => {
    if (a.isPinned && !b.isPinned) {
      return -1
    }
    if (!a.isPinned && b.isPinned) {
      return 1
    }
    return 0
  })
}

function getMediaUrl(mediaObject: NotionMedia): string {
  if (!mediaObject) {
    return ''
  }

  switch (mediaObject.type) {
    case 'external':
      return mediaObject.external.url
    case 'file':
      return mediaObject.file.url
    case 'emoji':
      return mediaObject.emoji
    default:
      return ''
  }
}
