export class UniversitySearch{
  id?: number
  name? : any
  alias?: string
  website?: string
  createdAt?: string
  updatedAt?: string
  deleted?: boolean
  toString(): string {
    return this.name;
  }
}
