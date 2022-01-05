import { Document } from 'mongoose'

export interface IRestaurant extends Document {
  img_url: string
  descrizione: string
  tipologia: string
  nome: string
  comune: string
  via: string
  telefono: string
  email: string
  web: string
  latitudine: string
  longitudine: string
  provincia: string
  cap: string
}

export const RESTAURANT_PERMISSIONS = {
  CREATE: 'resttaurant.create',
  UPDATE: 'resttaurant.update',
  DELETE: 'resttaurant.delete',
  READ: 'resttaurant.read',
}
