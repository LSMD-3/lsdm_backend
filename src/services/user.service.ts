import { DomainError, NOT_ALLOWED_CODE, NOT_FOUND_CODE } from '@/exceptions'
import { IUser, USER_PERMISSIONS } from '@/interfaces'
import { User } from '@/models'
import userService from '@/relations-service/services/user.service'
import UserRelations from '@/relations-service/UserRelations'
import { AbstractService, ProjectType } from './abstract.service'

class UserService extends AbstractService<IUser> {
  public getEntityManager = () => User
  public getPermissions = () => USER_PERMISSIONS
  public projectFieldsSearch = (type: ProjectType) => {
    if (type === 'base') return 'all'
    return '_id'
  }

  public blackListUpdateFields = { logins: 1 }

  public async getEmailByIds(ids: string[]) {
    const emails = await User.find({ _id: { $in: ids } }, 'email')
    return emails
  }

  public async invalidateSessions(id: string, date: Date) {
    let user = await this.getEntityManager().findById(id)
    if (!user) throw new DomainError('', 404, NOT_FOUND_CODE.ENTITY_NOT_FOUND, 'User not found', 'User not found')
    user.ignoreTokensBefore = date ?? new Date()
    await user.save()
  }

  public async add(data: IUser): Promise<IUser> {
    const user = await super.add(data)
    try {
      await userService.createNode({ _id: data._id, email: data.email, name: data.name, surname: data.surname })
    } catch (error) {
      await super.delete(data._id)
      throw new Error('Failed to add user in neo4j')
    }
    return user
  }

  public async update(data: IUser): Promise<IUser> {
    const user = await super.update(data)
    // TODO update neo
    return user
  }

  public async delete(userId: string) {
    try {
      await userService.deleteNode(userId)
      await super.delete(userId)
    } catch (error) {
      throw new Error('Failed to delete user in neo4j')
    }
  }
}

export default new UserService()
