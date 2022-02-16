import { IUser } from '@/interfaces'
import { Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import { mongoConnections } from '@/loaders/mongoose'

var User = new Schema(
  {
    name: { type: String },
    surname: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    userType: { type: String, enum: ['user', 'admin', 'chef', 'waiter', 'super-admin'], default: 'user' },
    logins: { type: [Date], default: [] },
    locked: { type: Boolean, default: false },
    ignoreTokensBefore: { type: Date }, //Used to invalidate sessions
  },
  {
    timestamps: true,
  }
)

User.pre('save', async function save(next: any) {
  try {
    if (!this.isModified('password')) return next()
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    return next()
  } catch (e) {
    return next(e)
  }
})

User.methods.validatePassword = async function validatePassword(password: string) {
  return bcrypt.compare(password, this.password)
}

export default mongoConnections['main'].model<IUser>('users', User)
