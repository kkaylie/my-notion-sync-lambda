# My Notion Sync Lambda

An AWS Lambda function that synchronizes published blog posts from a Notion database to a PostgreSQL database. The function supports incremental sync, only synchronizing content that has been updated since the last sync.

## Features

- 🔄 **Incremental Sync**: Only syncs articles updated since the last sync
- 📝 **Markdown Conversion**: Automatically converts Notion page content to Markdown format
- 🎯 **Status Filtering**: Only syncs articles with "Published" status
- 💾 **Database Operations**: Supports inserting new articles and updating existing ones
- ⚡ **Serverless**: Serverless architecture based on AWS Lambda
- 🏗️ **TypeScript**: Written in TypeScript for type safety

## Tech Stack

- **Runtime**: Node.js 22
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Cloud Service**: AWS Lambda
- **Build Tool**: esbuild
- **Key Dependencies**:
  - `@notionhq/client`: Notion API client
  - `notion-to-md`: Notion page to Markdown converter
  - `pg`: PostgreSQL client
  - `@aws-sdk/*`: AWS SDK

## Project Structure

```text
.
├── src/
│   ├── index.ts           # Lambda entry function
│   ├── notionAPIs.ts      # Notion API interactions
│   ├── database.ts        # PostgreSQL database operations
│   ├── databaseConfig.ts  # Database configuration
│   ├── notionHelpers.ts   # Notion data processing helpers
│   ├── syncTimestamp.ts   # Sync timestamp management
│   └── types/
│       └── notion.ts      # TypeScript type definitions
├── esbuild.config.js      # Build configuration
├── run-local.ts          # Local testing script
└── package.json
```

## Requirements

- Node.js 18+ (Node.js 22 recommended)
- AWS account
- Notion integration and API key
- PostgreSQL database

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/kkaylie/my-notion-sync-lambda.git
cd my-notion-sync-lambda
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Or using pnpm
pnpm install
```

### 3. Environment Configuration

Create a `.env` file and configure the following environment variables:

```env
# Notion API Configuration
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# PostgreSQL Database Configuration
DB_HOST=your-db-host.com
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database-name
DB_PORT=5432

# AWS Configuration
AWS_REGION=your-aws-region
```

### 4. Database Table Structure

Ensure your PostgreSQL database has the following table structure:

```sql
CREATE TABLE posts (
    id VARCHAR PRIMARY KEY,
    title VARCHAR NOT NULL,
    slug VARCHAR UNIQUE,
    summary TEXT,
    published_date TIMESTAMP,
    is_pinned BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    cover VARCHAR,
    icon VARCHAR,
    markdown TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Development

### Local Development

```bash
# Build and run in development mode
npm run start

# Build only (development mode)
npm run build:dev
```

### Production Build

```bash
# Build in production mode
npm run build:prod

# Package deployment bundle
npm run package
```

### Clean Build Files

```bash
npm run clean
```

## Deployment

### 1. Build Deployment Package

```bash
npm run package
```

This will generate a `deployment-package.zip` file.

### 2. Deploy to AWS Lambda

You can deploy using one of the following methods:

- **AWS CLI**: Use `aws lambda` commands
- **AWS Console**: Upload zip file directly
- **AWS SAM**: Use SAM templates
- **Serverless Framework**: Use serverless configuration

### 3. Configure Triggers

It's recommended to set up a CloudWatch Events scheduled trigger, for example, to execute every hour:

```text
cron(0 * * * ? *)
```

## Workflow

1. **Get Timestamp**: Retrieve the last sync time from storage
2. **Query Notion**: Get published articles updated since the last sync
3. **Content Conversion**: Convert Notion page content to Markdown
4. **Database Sync**: Save article data to PostgreSQL
5. **Update Timestamp**: Save the current sync timestamp

## Environment Variables

| Variable Name        | Required | Description                  |
| -------------------- | -------- | ---------------------------- |
| `NOTION_API_KEY`     | ✅       | Notion integration API key   |
| `NOTION_DATABASE_ID` | ✅       | Notion database ID to sync   |
| `DB_HOST`            | ✅       | PostgreSQL host address      |
| `DB_USER`            | ✅       | Database username            |
| `DB_PASSWORD`        | ✅       | Database password            |
| `DB_NAME`            | ✅       | Database name                |
| `DB_PORT`            | ✅       | Database port (usually 5432) |
| `AWS_REGION`         | ✅       | AWS region                   |

## Important Notes

- Ensure the Notion integration has permissions to access the target database
- PostgreSQL connection requires proper network configuration
- Lambda function needs appropriate IAM permissions to access required AWS services
- It's recommended to configure VPC and security groups for production environments

## License

MIT License
