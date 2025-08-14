import type { PageObjectResponse } from '@notionhq/client'

export type PagePropertyValue = PageObjectResponse['properties'][string]

export interface BlogPost {
  id: string
  title: string
  slug: string
  publishedDate: string
  updatedDate: string
  summary: string
  tags?: string[]
  isPinned?: boolean
  cover?: string
  icon?: string
}

export interface PostContent extends BlogPost {
  markdown: string
}

export type NotionMedia =
  | PageObjectResponse['cover']
  | PageObjectResponse['icon']
