import expressLoader from './express'
import { RedisClient } from './redis'

export default async ({ expressApp }: any) => {
  expressLoader({ app: expressApp })
}
