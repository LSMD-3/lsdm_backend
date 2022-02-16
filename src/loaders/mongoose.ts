import mongoose, { Connection } from 'mongoose'
import config from '@/config'

export const mongoConnections: { [name: string]: Connection } = getObject(
  config.databaseUris.map((dbObject: { name: string; uri: string }) => {
    const conn = mongoose.createConnection(dbObject.uri, {
      connectTimeoutMS: 5000,
      maxPoolSize: 5,
      w: 1,
      readPreference: 'nearest',
    })

    conn.once('open', () => {
      console.log('MongoDB database conn enstablished ' + dbObject.uri)
    })

    conn.on('error', (err) => {
      console.log('Mongoose error:' + err)
    })

    return { conn, name: dbObject.name }
  })
)

function getObject(connections: { conn: Connection; name: string }[]): { [name: string]: Connection } {
  let obj: { [name: string]: Connection } = {}
  for (let i = 0; i < connections.length; i++) obj[connections[i].name] = connections[i].conn
  return obj
}
