import neo4j, { Session } from 'neo4j-driver'

const connectToNeo4j = async () => {
  console.log('Starting Neo4j..')

  let driver = neo4j.driver('bolt://52.90.199.112:7687', neo4j.auth.basic('neo4j', 'tear-perforation-mittens'))
  var session = driver.session()

  return session
}

// @ts-ignore
let Neo4jClient: { db: Session } = { db: undefined }
// @ts-ignore
connectToNeo4j().then((val) => (Neo4jClient.db = val))
export default Neo4jClient as { db: Session }
