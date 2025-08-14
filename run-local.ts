import 'dotenv/config'
import { handler } from './src/index'

async function main() {
  console.log('Running local test of Lambda handler...')
  const result = await handler({})
  console.log('Handler finished with result:', result)
}

main()
