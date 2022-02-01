import neo4j from 'neo4j-driver'

class Connector {
  private driver
  constructor({ path, username, password }: Neo4jConnector) {
    console.log('Starting Neo4j..')
    const driver = neo4j.driver(path, neo4j.auth.basic(username, password))
    this.driver = driver
  }

  session() {
    return Neo4jClient.driver.session()
  }
}

// Interfaces
export interface Neo4jConnector {
  path: string
  username: string
  password: string
}

export const Neo4jClient = new Connector({
  path: 'neo4j+s://e5721e84.databases.neo4j.io',
  username: 'neo4j',
  password: 'IKfPEcvPBsOkOrYC4Gi71yAwo13-j1CBWJ9VUsV4DT0',
})
