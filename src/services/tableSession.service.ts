import { ITableSession, IOrder, TABLE_SESSION_PERMISSIONS } from '@/interfaces'
import { TableSession } from '@/models'
import { AbstractService, ProjectType } from './abstract.service'
import RedisClient from '@/loaders/redis'

class TableSessionService extends AbstractService<ITableSession> {
  public getEntityManager = () => TableSession
  public getPermissions = () => TABLE_SESSION_PERMISSIONS
  public projectFieldsSearch = (type: ProjectType) => {
    if (type === 'base') return 'all'
    return '_id'
  }
  blackListUpdateFields = {}

  public async getRestaurantTables(restaurant: string) {
    let keys = await RedisClient.db.HGET('Active_Restaurants', restaurant)
    if (!keys) return []
    const tables: string[] = JSON.parse(keys)
    return tables
  }

  // public async peristTableSession() {
  //   const sessions: ITableSession[] = []

  //   const orders: IOrder[]
  // }

  public extractOrdersfromRawValues(order: string, user: string, orderNumber: number): IOrder[] {
    const rawOrders = JSON.parse(order)
    const orders: IOrder[] = []
    rawOrders.forEach((o: any) => {
      orders.push({ clientId: user, recipeId: o._id, quantity: o.qty, orderNumber })
    })
    return orders
  }

  public async getAndSaveTableSession(restaurant: any, table: string) {
    let order_history = await RedisClient.db.HKEYS(`VR_${restaurant._id}_Table_${table}_Orders_History`)

    order_history.forEach(async (element, index) => {
      let order_list = await RedisClient.db.HVALS(`VR_${restaurant._id}_Table_${table}_Orders_History_${element}`)
      let partecipants = await RedisClient.db.HVALS(`VR_${restaurant._id}_Table_${table}_Orders_Customers_History_${element}`)
      let ordersToSave: IOrder[] = []

      for (let i = 0; i < order_list.length; i++) {
        let parsed_orders = JSON.parse(order_list[i])

        console.log(parsed_orders)
        console.log(partecipants[index])
        ordersToSave.push({ client: parsed_orders[1], recipes: parsed_orders[0] })
      }
      let parsed_partecipants = JSON.parse(partecipants[index])
      const session = new TableSession({ restaurant: restaurant, tableId: table, parsed_partecipants, orders: ordersToSave })
      // //await RedisClient.db.DEL(`VR_${restaurant._id}_Table_${table}_Orders_History_${element}`)
      // //await RedisClient.db.DEL(`VR_${restaurant._id}_Table_${table}_Orders_Customers_History_${element}`)
      // let table_still_active = await RedisClient.db.HLEN(`VR_${restaurant._id}_Table_${table}_Orders`)
      // if (!table_still_active) {
      //   let update_tables = await RedisClient.db.HGET(`Active_Restaurants`, `${restaurant._id}_Active_Tables`)
      //   update_tables = JSON.parse(update_tables)
      //   const index = update_tables.indexOf(table_id)
      //   if (index > -1) {
      //     update_tables.splice(index, 1) // 2nd parameter means remove one item only
      //   }
      //   update_tables = JSON.stringify(update_tables)
      //   await this.hset('Active_Restaurants', `${restaurant._id}_Active_Tables`, update_tables)
      // }
      await session.save()
    })
    // await RedisClient.db.DEL(`VR_${restaurant._id}_Table_${table}_Orders_History`)
    //await RedisClient.db.DEL(`VR_${restaurant._id}_Table_${table}_Orders_Customers_History`)

    return
  }

  /*'[{"rec_1":4,"quantity":3,"notes":"no spice","status":"preparing"},{"rec_1":4,"quantity":3,"notes":"no spice","status":"preparing"},{"rec_1":4,"quantity":3,"notes":"no spice","status":"preparing"}]'
   */

  public async backupRestaurant(restaurant: any) {
    console.log(restaurant)
    let tables = await RedisClient.db.HGET('Active_Restaurants', `${restaurant}_Active_Tables`)
    let tableInfo = await RedisClient.db.HGET('Active_Restaurants', `${restaurant}`)
    tables = JSON.parse(tables)
    tableInfo = JSON.parse(tableInfo)
    if (!tables) return { restaurant: tableInfo, total_sessions: 0 }
    console.log('Backing up restaurant: ' + restaurant)
    const promises = tables.map((t) => this.getAndSaveTableSession(tableInfo, t))
    // const result = await Promise.all(promises)
    console.log(tables)
    return 'ok' //result
  }

  public async backupFromRedis() {
    // 1. retrive all active restaurant from redis
    let keys = await RedisClient.db.HKEYS('Active_Restaurants')
    console.log(keys)
    var PATTERN = '_Active_Table'
    let filtered = keys.filter(function (str) {
      return str.indexOf(PATTERN) === -1
    })

    const promises = filtered.map((k) => this.backupRestaurant(k))

    const result = await Promise.all(promises)
    return 'ok'
    //return result
  }
  public async getRecipesRanking(reduced: boolean) {
    const pipeline = [
      {
        $match: {
          orders: {
            $ne: [],
          },
        },
      },
      {
        $project: {
          _id: 0,
          'orders.recipeId': 1,
        },
      },
      {
        $unwind: {
          path: '$orders',
        },
      },
      {
        $project: {
          recipeId: '$orders.recipeId',
        },
      },
      {
        $group: {
          _id: '$recipeId',
          total: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          total: -1,
        },
      },
    ]
    if (reduced)
      pipeline.push({
        $project: {
          total: 1,
          _id: 0,
        },
      })

    const result = await TableSession.aggregate(pipeline)
    return result
  }

  public async getUserRanking(reduced: boolean) {
    const pipeline = [
      {
        $match: {
          orders: {
            $ne: [],
          },
        },
      },
      {
        $project: {
          _id: 0,
          'orders.clientId': 1,
          'orders.recipeId': 1,
          'orders.quantity': 1,
        },
      },
      {
        $unwind: {
          path: '$orders',
        },
      },
      {
        $group: {
          _id: '$orders.clientId',
          total: {
            $sum: '$orders.quantity',
          },
        },
      },
      {
        $sort: {
          total: -1,
        },
      },
    ]
    if (reduced)
      pipeline.push({
        $project: {
          total: 1,
          _id: 0,
        },
      })

    const result = await TableSession.aggregate(pipeline)
    return result
  }
}

export default new TableSessionService()
