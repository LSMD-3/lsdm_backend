# Recipe Collection: [mike]

- replace ingredients list with just name of the ingredient -> ingredients[]

# Restaurant Collection: [marco]

- change the model following the example
- set ayce flag, price of menu
- add new recipe from scratch will push it also il recipes collection
- CRUD of a recipe inside a Menu (update everything about the recipe-> price, name, imageUrl)
- Remove from frontend auto assignment for waiter and chef
- Admin to add new restaurant -> CRUD
- Add/Remove of restaurant staff
- when user click on the recipe, show poupop with details of it

# Redis [jack]

- Store redudancy informations in redis
- Talk about concistency used approach

# Neo4j [mike]

- create random relationships between nodes [Generator]
- generateRandomUserFollows, generateRandomRestaurantLike, generateRandomRecipeLike

# Documentation [jack]

- Review and Refactor

# Aggregations

- Define smart aggregations [all]
- need to be displayed in the admin FE

# Neo4j clarification

- Store redudancy informations in neo4j
- Talk about concistency used approach
- add some informations in the nodes ( user email/name/surname, recipe name, restaurant name)
- attach neo4jservices in the crud operations of menu ( add a recipe -> add in neo4j etc.)
- random user generator -> when we create a user in mongo -> we have to create it in neo (the same for update/delete)

- When we add a new restaurant -> store it in neo4j
- When we update a new restaurant -> update in neo4j
- Detete a restaurant -> delete restaurant and detach all relations

- When we add a new recipe to a menu -> store it in neo4j
- When we update a new recipe -> update in neo4j
- Detete a recipe -> delete recipe and detach all relations
