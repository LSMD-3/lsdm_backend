export class GenericSearch {
  general?: GeneralFilter
  equal?: BaseAndOrFilter | BaseFilter
  like?: BaseAndOrFilter | BaseFilter
  range?: RangeFilter
  dateRange?: DateRangeFilter
  offset?: number
  limit?: number
  sort?: SortField[]
  projectFieldsSearch?: string | 'all'
  customProject?: string

  private handleEqualLike(equal: BaseAndOrFilter | BaseFilter, orObj: OrArray, andObj: AndArray, type: 'like' | 'equal') {
    if ((equal as BaseFilter).field) {
      //equal is a simple base filter
      const eq = equal as BaseFilter
      orObj.$or.push(this.getRegexpObj(eq, type))
    } else {
      //equal is a BaseAndOrFilter
      const eq = equal as BaseAndOrFilter
      if (eq.and) this.handleEqualCondition(eq.and, andObj, type)
      if (eq.or) this.handleEqualCondition(eq.or, orObj, type)
    }
  }

  private getRegexpObj(filter: BaseFilter, type: 'equal' | 'like') {
    let fieldObj: any = {}
    if (type === 'equal') {
      if (typeof filter.value !== 'boolean') {
        let regexObj: any = { $regex: `^${filter.value}$` }
        if (!filter.caseSensitive) regexObj.$options = 'i'
        fieldObj[filter.field] = regexObj
      } else {
        let obj: any = {}
        obj[filter.field] = filter.value
        fieldObj[filter.field] = obj
      }
    }
    if (type === 'like') {
      let regexObj: any = { $regex: filter.value }
      if (!filter.caseSensitive) regexObj.$options = 'i'
      fieldObj[filter.field] = regexObj
    }
    return fieldObj
  }

  private handleEqualCondition(equal: BaseFilter[], equalObj: any, type: 'equal' | 'like') {
    equal.forEach((e) => {
      if (equalObj.$or) equalObj.$or.push(this.getRegexpObj(e, type))
      if (equalObj.$and) equalObj.$and.push(this.getRegexpObj(e, type))
    })
  }

  private getQuery() {
    let query: any = []
    let orObj: OrArray = { $or: [] }
    let andObj: AndArray = { $and: [] }
    if (this.projectFieldsSearch && this.projectFieldsSearch !== 'all') {
      const projectObject: any = {}
      this.projectFieldsSearch.split(' ').forEach((field) => (projectObject[field] = 1))
      query.push({
        $project: projectObject,
      })
    }
    if (this.general && this.general.value) this.handleGeneral(this.general, query)
    if (this.dateRange) this.handleRange(this.dateRange, andObj, orObj)
    if (this.range) this.handleRange(this.range, andObj, orObj)
    if (this.equal) this.handleEqualLike(this.equal, orObj, andObj, 'equal')
    if (this.like) this.handleEqualLike(this.like, orObj, andObj, 'like')
    if (orObj.$or.length > 0 && andObj.$and.length > 0) query.push({ $match: { $and: [orObj, andObj] } })
    else {
      //Just and setted
      if (andObj.$and.length > 0) query.push({ $match: andObj })
      //Just or setted
      else if (orObj.$or.length > 0) query.push({ $match: orObj })
      else query.push({ $match: {} })
    }
    if (this.sort) this.handleSort(this.sort, query)
    return query
  }

  get aggregate() {
    return this.getQuery()
  }

  get aggregateCount() {
    let query = this.getQuery()
    query.push({ $count: 'ct' })
    return query
  }

  private handleGeneral(general: GeneralFilter, query: any) {
    query.push({
      $addFields: {
        general: {
          $concat: general.fields,
        },
      },
    })
    query.push({
      $match: {
        general: {
          $regex: general.value,
          $options: 'i',
        },
      },
    })
  }

  private handleRange(range: RangeFilter | DateRangeFilter, rangeAnd: AndArray, rangeOr: OrArray) {
    if (range.or) this.handleRangeCondition(range, rangeOr)
    if (range.and) this.handleRangeCondition(range, rangeAnd)
  }

  private handleRangeCondition(range: RangeFilter | DateRangeFilter, rangeObj: any) {
    let app: RangeFilterItem[] | DateRangeFilterItem[] = []
    if (rangeObj.$or) app = Array.isArray(range.or) ? range.or : [range.or]
    if (rangeObj.$and) app = Array.isArray(range.and) ? range.and : [range.and]
    app.forEach((range: any) => {
      let dateGtObject: any = {}
      dateGtObject[range.field] = { $gte: range.min ? range.min : new Date(range.start) }
      let dateLtObject: any = {}
      dateLtObject[range.field] = { $lte: range.max ? range.max : new Date(range.end) }
      if (rangeObj.$or) rangeObj.$or.push({ $and: [dateGtObject, dateLtObject] })
      if (rangeObj.$and) rangeObj.$and.push({ $and: [dateGtObject, dateLtObject] })
    })
  }

  private handleSort(sort: SortField | SortField[], query: any) {
    const sortApp: SortField[] = Array.isArray(sort) ? sort : [sort]
    let sortObj: { $sort: any } = { $sort: {} }
    sortApp.forEach((sortField) => (sortObj.$sort[sortField.field] = sortField.direction))
    if (sortApp.length > 0) sortObj.$sort['_id'] = 1 //Always return the same values when sorting in 2 different times
    query.push(sortObj)
  }
}

export enum SortDirection {
  ASCENDING = 1,
  DESCENDING = -1,
}

export interface OrArray {
  $or: any[]
}

export interface AndArray {
  $and: any[]
}

export interface SortField {
  field: string
  direction: SortDirection
}

export interface BaseFilter {
  field: string
  value: string | number | boolean
  caseSensitive: boolean
}

export interface BaseAndOrFilter {
  or: BaseFilter[]
  and: BaseFilter[]
}

export interface GeneralFilter {
  fields: string[]
  value: string | number | boolean
}

export interface RangeFilterItem {
  field: string
  min: number
  max: number
}

export interface RangeFilter {
  or: RangeFilterItem[]
  and: RangeFilterItem[]
}

export interface DateRangeFilter {
  or: DateRangeFilterItem[]
  and: DateRangeFilterItem[]
}
export interface DateRangeFilterItem {
  field: string
  start: string | number
  end: string | number
}
