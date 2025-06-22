export interface Review {
  id?: string;
  instituteId?: number
  instituteName?: string
  title?: string
  description?: string;
  reviewType?: string
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
}
