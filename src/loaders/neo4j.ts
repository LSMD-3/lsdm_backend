import neo4j from 'neo4j-driver'
import { Driver } from 'neo4j-driver-core'

const connectToNeo4j = async () => {
  console.log('Starting Neo4j..')

  let driver = neo4j.driver('bolt://52.90.199.112:7687', neo4j.auth.basic('neo4j', 'tear-perforation-mittens'))
  
  return driver
}

// @ts-ignore
let Neo4jClient: { driver: Driver } = { driver: undefined }
// @ts-ignore
connectToNeo4j().then((val) => (Neo4jClient.driver = val))

export default Neo4jClient as { driver: Driver }
