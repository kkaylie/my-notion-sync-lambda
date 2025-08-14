import {
  SSMClient,
  GetParameterCommand,
  PutParameterCommand,
} from '@aws-sdk/client-ssm'

const PARAMETER_NAME = '/my-blog/notion-sync/lastSuccessfulSyncTimestamp'
const ssmClient = new SSMClient({ region: process.env.AWS_REGION })

export async function getSyncTimestamp(): Promise<string> {
  console.log('Starting Notion sync process using SSM Parameter Store...')
  try {
    const getParameterCommand = new GetParameterCommand({
      Name: PARAMETER_NAME,
    })

    const parameterOutput = await ssmClient.send(getParameterCommand)
    const lastSyncTime =
      parameterOutput.Parameter?.Value || new Date(0).toISOString()

    console.log(`Last sync was at: ${lastSyncTime}`)

    return lastSyncTime
  } catch (error: any) {
    if (error.name === 'ParameterNotFound') {
      // If the parameter does not exist, return a default value
      console.log('Parameter not found. Returning default timestamp.')
      return new Date(0).toISOString() // Default to epoch start
    }
    throw error // Re-throw other errors
  }
}

export async function saveSyncTimestamp(timestamp: string): Promise<void> {
  console.log(`Saving sync timestamp: ${timestamp}`)
  const putParameterCommand = new PutParameterCommand({
    Name: PARAMETER_NAME,
    Value: timestamp,
    Type: 'String',
    Overwrite: true, // Overwrite the existing parameter
  })

  await ssmClient.send(putParameterCommand)
  console.log(`Successfully updated sync timestamp to: ${timestamp}`)
}
