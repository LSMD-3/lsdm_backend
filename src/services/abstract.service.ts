import { DomainError, NOT_ALLOWED_CODE, NOT_FOUND_CODE } from '@/exceptions'
import { GenericSearch } from '@/utils'
import { Model, Document } from 'mongoose'

export interface EntityPermissions {
  CREATE: string
  UPDATE: string
  DELETE: string
  READ: string
}

export type ProjectType = string | 'base'

export abstract class AbstractService<T extends Document> {
  public abstract getEntityManager: () => Model<T>
  public abstract getPermissions: () => EntityPermissions
  //Default type is "base", check user.service.ts for example implementation
  public abstract projectFieldsSearch: (type: ProjectType) => string | 'all'
  public abstract blackListUpdateFields: { [field: string]: number }

  public async add(data: T): Promise<T> {
    const _entity = new (this.getEntityManager())()
    Object.keys(data).forEach((field) => ((_entity as any)[field] = (data as any)[field]))
    return _entity.save()
  }

  public async update(data: T, skipFind: boolean = false): Promise<T> {
    let _entity: any
    _entity = skipFind ? data : await this.getEntityManager().findById(data._id)
    if (!_entity) throw new DomainError('', 404, NOT_FOUND_CODE.ENTITY_NOT_FOUND)
    delete data.__v // prevent mongoose versioning override
    Object.keys(data).forEach((field) => {
      if (this.blackListUpdateFields[field]) return
      ;(_entity as any)[field] = (data as any)[field]
    })
    return _entity.save()
  }

  public async get(entityid: string, projectFields?: string): Promise<any> {
    const result = this.projectFieldsSearch(projectFields ?? 'base')
    if (result === 'all') return this.getEntityManager().findById(entityid)
    return this.getEntityManager().findById(entityid, result)
  }

  public async delete(entityid: string): Promise<any> {
    return this.getEntityManager().findByIdAndDelete(entityid)
  }

  public async advancedSearch(search: GenericSearch): Promise<T[]> {
    //Quando si deve projectare qualcosa, creare la lista dei campi nella funzione projectFieldSearch e poi passarlo dentro search in projectFieldsSearch
    search.projectFieldsSearch = this.projectFieldsSearch ? this.projectFieldsSearch(search.customProject ?? 'base') : 'all'
    const transaction = this.getEntityManager().aggregate(search.aggregate)
    if (search.limit !== undefined && search.offset !== undefined) transaction.skip(search.offset).limit(search.limit)
    return transaction
  }

  public async advancedCount(search: GenericSearch): Promise<number> {
    const transaction = this.getEntityManager()
      .aggregate(search.aggregateCount)
      .then((r) => {
        return Promise.resolve(r[0] ? r[0].ct : 0)
      })
    return transaction
  }
}
