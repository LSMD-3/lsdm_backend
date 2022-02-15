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
  path: 'neo4j+s://8d11bd1e.databases.neo4j.io',
  username: 'neo4j',
  password: 'w6bdQ1OUMbmMe5ieVYIl3cz4Ve8JjgQuEflsAlun-y4',
})
