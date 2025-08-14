# My Notion Sync Lambda

This project provides an AWS Lambda function to synchronize data with Notion.

## Features

- Syncs data between your application and Notion
- Easy deployment to AWS Lambda
- Configurable via environment variables

## Prerequisites

- AWS account
- Notion integration and API key
- Node.js (if developing locally)

## Setup

1. Clone the repository:

```bash
git clone https://github.com/kkaylie/my-notion-sync-lambda.git
cd my-notion-sync-lambda
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables in your `.env` file:

```
# Notion creds
NOTION_API_KEY=...
NOTION_DATABASE_ID=...

# PostgreSQL DB creds
DB_HOST=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
DB_PORT=...

# AWS Region
AWS_REGION=...
```

4. Deploy to AWS Lambda using your preferred method (e.g., AWS CLI, SAM, or Serverless Framework).

## Usage

Trigger the Lambda function via AWS events (e.g., API Gateway, scheduled events) to sync data with Notion.

## License

MIT License.
