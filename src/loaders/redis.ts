import { createClient } from 'redis'
import { RedisClientType } from '@node-redis/client'

const connectToRedis = async () => {
  console.log('Starting Redis..')

  const client = createClient({
    url: 'redis://127.0.0.1:6379',
  })

  client.on('error', (err) => console.log('Redis Client Error', err))

  await client.connect()

  return client
}

// @ts-ignore
let RedisClient: { db: RedisClientType } = { db: undefined }
// @ts-ignore
connectToRedis().then((val) => (RedisClient.db = val))
export default RedisClient as { db: RedisClientType }
