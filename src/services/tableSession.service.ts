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

  public async getAndSaveTableSession(restaurant: string, table: string) {
    let order_history = await RedisClient.db.HKEYS('VR_' + restaurant + '_Table_' + table + '_Orders_History')

    const response: any[] = []
    // console.log(order_history)
    order_history.forEach(async (element) => {
      // console.log(`LOOKING FOR rest:${restaurant}, table:${table}, session:${element}`)
      let order_list = await RedisClient.db.HVALS(`VR_${restaurant}_Table_${table}_Orders_History_${element}`)
      let order_list_users = await RedisClient.db.HVALS(`VR_${restaurant}_Table_${table}_Orders_History_to_users_${element}`)

      let ordersToSave: IOrder[] = []
      // const orders = JSON.parse(order_list)
      order_list.forEach(async (order, index) => {
        const user: string = order_list_users[index]
        ordersToSave = ordersToSave.concat(this.extractOrdersfromRawValues(order, user, index))
      })
      const partecipants = [...new Set(order_list_users)]
      const session = new TableSession({ restaurantId: restaurant, tableId: table, partecipants, orders: ordersToSave })
      response.push({ session: `VR_${restaurant}_Table_${table}_Orders_History_${element}`, orders: ordersToSave.length })
      await session.save()
    })

    return response
  }

  /*'[{"rec_1":4,"quantity":3,"notes":"no spice","status":"preparing"},{"rec_1":4,"quantity":3,"notes":"no spice","status":"preparing"},{"rec_1":4,"quantity":3,"notes":"no spice","status":"preparing"}]'
   */

  public async backupRestaurant(restaurant: string) {
    const tables = await this.getRestaurantTables(restaurant)
    if (!tables) return { restauranId: restaurant, total_sessions: 0 }
    console.log('Backing up restaurant: ' + restaurant)
    const promises = tables.map((t) => this.getAndSaveTableSession(restaurant, t))
    const result = await Promise.all(promises)

    return result
  }

  public async backupFromRedis() {
    // 1. retrive all active restaurant from redis
    let keys = await RedisClient.db.HKEYS('Active_Restaurants')
    const promises = keys.map((k) => this.backupRestaurant(k))

    const result = await Promise.all(promises)

    await RedisClient.db.FLUSHALL()

    return result
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
