# Marco

- edit menu informations (set ayce flag, price of menu)
- edit recipe in menu
- shortcut to create and add a new recipe
- when user click on the recipe, show poupop with details of it
- Filter for ingredients and search recipe in menu

# Giacomo

# Michael

- Ricette con più like e meno like

# Use Cases

# Redis [jack]

- Talk about concistency used approach

# Neo4j [mike]

- [da_integrare] create random relationships between nodes [Generator]
- [da_integrare] generateRandomUserFollows, generateRandomRestaurantLike, generateRandomRecipeLike

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

- dobbiamo anche mettere la possibilità di scegliere il menu
- visualizzazione del singolo ristorante con i suoi menu
- browsing complesso ristoranti -> visualizzazione tabella
- dentro il ristorante visualizzare ricette di tendenza
- sul profilo utente -> suggerire 5 ristoranti più piaciuti dai followee

# Statistics

- piatto più ordinato in base ad una posizione
- il piatto che ha più like
- ricette più ordinate nei ristoranti più visitati
- ranking categorie
