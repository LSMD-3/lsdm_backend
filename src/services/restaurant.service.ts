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
    await this.hsetnx('VR_' + restaurant_id, 'Table_' + table_id + '_customers', customers)
    await this.hsetnx('VR_' + restaurant_id, 'Table_' + table_id + '_status', status)
    return 'VR_' + restaurant_id + '_Table_' + table_id
  }

  public async join_table(restaurant_id: string, table_id: string, customer: any) {
    var table_exists = await this.exist('VR_' + restaurant_id)

    if (table_exists === 0) {
      var to_insert_customers = JSON.stringify({ id_1: customer })
      await this.createTable(restaurant_id, table_id, to_insert_customers, 'occupied')
    } else {
      let customers = await this.hget('VR_' + restaurant_id, 'Table_' + table_id + '_customers')
      let obj = JSON.parse(customers)
      let count = Object.keys(obj).length + 1
      obj['id_' + count] = customer
      let to_save = JSON.stringify(obj)
      this.hset('VR_' + restaurant_id, 'Table_' + table_id + '_customers', to_save)
      this.hset('VR_' + restaurant_id, 'Table_' + table_id + '_status', 'occupied')
    }
    return 'ok'
  }

  public async createOrder(restaurant_id: string, table_id: string, orders: any[]) {
    var table_exists = await RedisClient.db.HEXISTS('VR_' + restaurant_id, 'Table_' + table_id + '_customers')
    if (!table_exists) {
      //Check if table exists
      return 'The table does not exist'
    }

    let orders_len: number = 0
    let exists = await RedisClient.db.HLEN('VR_' + restaurant_id + '_Table_' + table_id + '_Orders')

    if (exists == 0) {
      //check if orders exists
      await this.hset('VR_' + restaurant_id + '_Table_' + table_id + '_Orders', String(1), JSON.stringify(orders))
      return exists
    } else {
      orders_len = exists + 1
      this.hset('VR_' + restaurant_id + '_Table_' + table_id + '_Orders', String(orders_len), JSON.stringify(orders))
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

  public async clone(restaurant_id: any, table_id: any) {
    let exists = await this.exist('VR_' + String(restaurant_id) + '_Table_' + String(table_id) + '_Orders')
    if (exists !== 0) {
      let res = await this.redis_clone(
        String('VR_' + String(restaurant_id) + '_Table_' + String(table_id) + '_Orders'),
        String('VR_' + String(restaurant_id) + '_Table_' + String(table_id) + '_Orders_copy')
      )
      return res
    }
    return 'something went wrong'
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
