import { ITableSession } from '@/interfaces'
import mongoose, { Schema } from 'mongoose'
import { mongoConnections } from '@/loaders/mongoose'

var TableSession = new Schema(
  {
    restaurant: { type: JSON },
    tableId: { type: String, required: true },
    partecipants: [{ type: JSON }],
    orders: [{ type: JSON }],
  },
  {
    timestamps: true,
  }
)

export default mongoConnections['main'].model<ITableSession>('tableSession', TableSession)
