import { IMenu, IRecipe, IRestaurant, MenuRecipes, RESTAURANT_PERMISSIONS, UserType } from '@/interfaces'
import RedisClient from '@/loaders/redis'
import TuplesObject from '@/loaders/redis'
import { Restaurant, Recipe } from '@/models'
import { AbstractService, ProjectType } from './abstract.service'
var fs = require('fs')
const Redis = require('ioredis')
const redis = new Redis(6379, '127.0.0.1')

interface MenuCreationPreferences {
  composition: { category: string; percentage: number }[]
  totalRecipes: number
  startPrice: number
  endPrice: number
}

type Order = {
  _id: string
  qty: number
  note?: string
  status?: string
}[]

type TableOrder = {
  tableId: string
  orders: Order[]
}

class RestaurantService extends AbstractService<IRestaurant> {
  public getEntityManager = () => Restaurant
  public getPermissions = () => RESTAURANT_PERMISSIONS
  public projectFieldsSearch = (type: ProjectType) => {
    if (type === 'base') return 'all'
    return '_id'
  }
  blackListUpdateFields = { latitudine: 1, longitudine: 1 }

  public async hset(map: string, key: string, value: any) {
    return RedisClient.db.HSET(map, key, value)
  }
  public async hsetnx(map: string, key: string, value: string) {
    return RedisClient.db.HSETNX(map, key, value)
  }

  public async hget(map: string, key: string): Promise<any> {
    return RedisClient.db.HGET(map, key)
  }

  public async exists_in(map: any, key: any) {
    return RedisClient.db.HEXISTS(map, key)
  }

  public async exist(map: any) {
    return RedisClient.db.HLEN(map)
  }

  public async getall(map: string) {
    const all = RedisClient.db.HGETALL(map)
    return all
  }

  public async createTable(restaurant_id: string, table_id: string, customers: string, status: string) {
    var restaurant_exists = await RedisClient.db.HEXISTS('Active_Restaurants', restaurant_id)
    if (!restaurant_exists) {
      await this.hset('Active_Restaurants', restaurant_id, JSON.stringify([table_id]))
    } else {
      let active_table = await this.hget('Active_Restaurants', restaurant_id)
      let table_array: string[] = JSON.parse(active_table)
      if (!table_array.includes(table_id)) table_array.push(table_id)

      await this.hset('Active_Restaurants', restaurant_id, JSON.stringify(table_array))
    }

    await this.hsetnx('VR_' + restaurant_id, 'Table_' + table_id + '_customers', customers)
    await this.hsetnx('VR_' + restaurant_id, 'Table_' + table_id + '_status', status)
    return 'VR_' + restaurant_id + '_Table_' + table_id
  }

  public async join_table(restaurant_id: string, table_id: string, customer: any) {
    var table_exists = await RedisClient.db.HEXISTS('VR_' + restaurant_id, 'Table_' + table_id + '_customers')

    if (!table_exists) {
      await this.createTable(restaurant_id, table_id, customer, 'occupied')
    } else {
      let customers = await this.hget('VR_' + restaurant_id, 'Table_' + table_id + '_customers')
      let to_save = customers + ',' + customer
      this.hset('VR_' + restaurant_id, 'Table_' + table_id + '_customers', to_save)
      this.hset('VR_' + restaurant_id, 'Table_' + table_id + '_status', 'occupied')
    }
    return 'ok'
  }

  public async createOrder(restaurant_id: string, table_id: string, user_id: string, orders: any[]) {
    var table_exists = await RedisClient.db.HEXISTS('VR_' + restaurant_id, 'Table_' + table_id + '_customers')
    if (!table_exists) {
      //Check if table exists
      return 'The table does not exist'
    }

    let orders_len: number = 0
    let exists = await RedisClient.db.HLEN('VR_' + restaurant_id + '_Table_' + table_id + '_Orders')
    if (exists == 0) {
      //check if orders exists
      this.hset('VR_' + restaurant_id + '_Table_' + table_id + '_Orders', String(1), JSON.stringify(orders))
      this.hset('VR_' + restaurant_id + '_Table_' + table_id + '_Orders_to_users', String(1), user_id)

      return exists
    } else {
      orders_len = exists + 1
      this.hset('VR_' + restaurant_id + '_Table_' + table_id + '_Orders', String(orders_len), JSON.stringify(orders))
      this.hset('VR_' + restaurant_id + '_Table_' + table_id + '_Orders_to_users', String(orders_len), user_id)
    }

    return 'ok'
  }

  public async get_order(restaurant_id: any, table_id: any, order_id: any) {
    var table_exists = await this.exists_in('VR_' + String(restaurant_id) + '_Table_' + String(table_id) + '_Orders', String(order_id))
    //return 'VR_' + String(restaurant_id) + '_Table_' + String(table_id) + '_Orders'
    if (table_exists) {
      var result = await this.hget('VR_' + String(restaurant_id) + '_Table_' + String(table_id) + '_Orders', String(order_id))
      return JSON.parse(result)
    }
    return 'Order does not exist'
  }

  public async redis_clone(map: any, key: any) {
    const redisLuaScript = fs.readFileSync(`${__dirname}/copy_key.lua`)
    const result1 = await redis.eval(redisLuaScript, 2, map, key)
    return result1
  }

  public async clone(source: string, destination: string) {
    let res = await this.redis_clone(source, destination)
    return res
  }

  public async checkout_Table(restaurant_id: any, table_id: any) {
    let exists = await this.exist('VR_' + String(restaurant_id) + '_Table_' + String(table_id) + '_Orders')
    if (exists !== 0) {
      let order_hist_number = await RedisClient.db.HLEN('VR_' + restaurant_id + '_Table_' + table_id + '_Orders_History')
      await this.hset(
        'VR_' + restaurant_id + '_Table_' + table_id + '_Orders_History',
        String(order_hist_number + 1),
        'VR_' + restaurant_id + '_Table_' + table_id + '_Orders_History_' + String(order_hist_number + 1)
      )
      await this.hset(
        'VR_' + restaurant_id + '_Table_' + table_id + '_Orders_History_to_users',
        String(order_hist_number + 1),
        'VR_' + restaurant_id + '_Table_' + table_id + '_Orders_History_to_users_' + String(order_hist_number + 1)
      )
      let res = await this.clone(
        String('VR_' + String(restaurant_id) + '_Table_' + String(table_id) + '_Orders'),
        'VR_' + restaurant_id + '_Table_' + table_id + '_Orders_History_' + String(order_hist_number + 1)
      )
      let res1 = await this.clone(
        String('VR_' + String(restaurant_id) + '_Table_' + String(table_id) + '_Orders_to_users'),
        'VR_' + restaurant_id + '_Table_' + table_id + '_Orders_History_to_users_' + String(order_hist_number + 1)
      )

      let del = await RedisClient.db.DEL('VR_' + String(restaurant_id) + '_Table_' + String(table_id) + '_Orders')
      del = await RedisClient.db.DEL('VR_' + String(restaurant_id) + '_Table_' + String(table_id) + '_Orders_to_users')
      del = await RedisClient.db.DEL('VR_' + String(restaurant_id))
      //return del
    }
    return 'something went wrong'
  }

  public async get_orders_for_user(restaurant_id: string, table_id: string, user_id: string) {
    let orders = await this.get_all_orders(restaurant_id, table_id)

    let users = await RedisClient.db.HGETALL('VR_' + restaurant_id + '_Table_' + table_id + '_Orders_to_users')
    orders = orders.reverse()
    let user_orders = []
    for (let i = 0; i < Object.keys(orders).length; i++) {
      if (user_id === users[String(i + 1)]) {
        user_orders.push(orders[i])
      }
    }
    return user_orders.reverse()
  }

  public async get_orders_for_chef(restaurant_id: string) {
    let keys = await RedisClient.db.HKEYS('VR_' + restaurant_id)
    const result: TableOrder[] = []

    for (let i = 0; i < keys.length; i += 2) {
      let table_sting = keys[i].split('_')
      let table_id = table_sting[1]
      let orders = await this.get_all_orders(restaurant_id, table_id)
      orders = orders.reverse()
      result.push({ tableId: table_id, orders })
    }
    return result
  }

  public async get_table_users(restaurant_id: string, table_id: string) {
    let users = await this.hget('VR_' + restaurant_id, 'Table_' + table_id + '_customers')
    return users.split(',')
  }

  public async update_order(restaurant_id: string, table_id: string, order_index: any, order: any) {
    this.hset('VR_' + restaurant_id + '_Table_' + table_id + '_Orders', String(parseInt(order_index) + 1), JSON.stringify(order))
    return 'ok'
  }

  public async get_all_orders(restaurant_id: any, table_id: any) {
    //var table_exists = await this.exists_in('VR_' + String(restaurant_id) + '_Table_' + String(table_id) + '_Orders', String(order_id))
    //return 'VR_' + String(restaurant_id) + '_Table_' + String(table_id) + '_Orders'

    var result = await this.getall('VR_' + String(restaurant_id) + '_Table_' + String(table_id) + '_Orders')
    const orders = []
    for (let i = 1; i < Object.keys(result).length + 1; i++) {
      orders.push(JSON.parse(result[String(i)]))
    }
    return orders.reverse()
    //return JSON.parse(result)
  }

  //public asyc setMultiple(map:string,keys:string[])

  public async addStaffToRestaurant(restaurantId: string, userId: string, userType: UserType): Promise<boolean> {
    const restaurant = await Restaurant.findById(restaurantId, 'menu')
    if (!restaurant) return false

    if (userType === 'chef') {
      if (restaurant.chefs) restaurant.chefs.push(userId)
      else restaurant.chefs = [userId]
    }
    if (userType === 'waiter') {
      if (restaurant.waiters) restaurant.waiters.push(userId)
      else restaurant.waiters = [userId]
    }
    if (userType === 'admin') {
      if (restaurant.admins) restaurant.admins.push(userId)
      else restaurant.admins = [userId]
    }
    await restaurant.save()
    return true
  }

  public async findRestaurantOfStaff(userId: string, userType: UserType): Promise<IRestaurant | null> {
    let query = undefined
    if (userType === 'chef') query = { chefs: userId }
    if (userType === 'waiter') query = { waiters: userId }
    if (userType === 'admin') query = { admins: userId }

    if (!query) return null
    const restaurant = await Restaurant.findOne(query)
    return restaurant
  }

  public async searchRestaurant(text: string) {
    const restaurants = await Restaurant.find({ nome: { $regex: `${text}`, $options: 'i' } }, 'nome').limit(5)
    return restaurants
  }

  public async getMenu(restaurantId: string): Promise<IMenu | undefined> {
    const restaurant = await Restaurant.findById(restaurantId, 'menu').populate('menu.recipes.recipe')
    if (!restaurant || restaurant.menu.recipes.length === 0) return undefined
    return restaurant.menu as IMenu
  }

  private async fetchRecipe(category: string, limit: number) {
    const recipes = await Recipe.find({ category: category }).limit(limit)
    return recipes
  }

  private getRandomPrice(start: number, end: number) {
    if (end < start) return 10
    const diff = end - start
    const price = Math.trunc(Math.random() * diff) + start
    return price
  }

  public async findRestaurantByIds(restaurantIds: string[]) {
    const restaurants = await Restaurant.find({ _id: { $in: restaurantIds } }, 'nome')
    return restaurants
  }

  public async createMenu(restaurantId: string, preferences: MenuCreationPreferences): Promise<IMenu | undefined> {
    const restaurant = await Restaurant.findById(restaurantId, 'nome')
    if (!restaurant) return undefined

    let n = preferences.totalRecipes
    let totalPercentages = preferences.composition.reduce((prev, curr) => prev + curr.percentage, 0)

    const promises: any = []
    preferences.composition.forEach((c) => {
      const limit = Math.round((c.percentage / totalPercentages) * n)
      if (limit === 0) return
      promises.push(this.fetchRecipe(c.category, limit))
    })
    const result = await Promise.all(promises)

    const recipes: any[] = []

    result.forEach((rs) => {
      rs.forEach((recipe: IRecipe) => {
        recipes.push({
          price: this.getRandomPrice(preferences.startPrice, preferences.endPrice),
          recipe: recipe._id,
        })
      })
    })

    const menu: IMenu = {
      ayce_available: true,
      name: restaurant.nome + ' menu',
      recipes: recipes,
    }

    restaurant.menu = menu
    await restaurant.save()
    return await this.getMenu(restaurantId)
  }

  public async updateMenu(): Promise<IMenu> {
    //todo
  }

  public async deleteMenu(): Promise<void> {
    //todo
  }
}

export default new RestaurantService()
