export interface Review {
  id?: string;
  instituteId?: number
  instituteName?: string
  title?: string
  description?: string;
  reviewType?: number
  rating?: number;
  likeCount?: number;
  dislikeCount?: number;
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
}
