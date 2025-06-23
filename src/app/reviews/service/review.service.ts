import { Injectable } from '@angular/core';

import {BehaviorSubject, Observable, tap, catchError, of} from 'rxjs';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environment/environment.development";
import { Review } from '../../model/Review';

export interface Comment {
  id?: string;
  content: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root' // This makes the service available application-wide
})
export class ReviewService {
  private apiUrl = environment.apiUrl;
  private reviewsSubject = new BehaviorSubject<any>([]);
  public reviews$ = this.reviewsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.getAllReviews(0,10);
  }

   getAllReviews(page : number, size : number) {

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())

    this.http.get<any>(`${this.apiUrl}/reviews`,{params}).subscribe({
      next: (reviews) => this.reviewsSubject.next(reviews),
      error: (err) => console.error('Error loading reviews:', err)
    });
  }

  getReviewById(id: string): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/reviews/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching review:', error);
        return of({} as Review);
      })
    );
  }

  submitReview(reviewData: any, page : number, size : number): Observable<any> {
    return this.http.post(`${this.apiUrl}/reviews`, reviewData).pipe(
      tap(() => this.getAllReviews(page,size))
    );
  }

  likeReview(reviewId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reviews/${reviewId}/like`, {}).pipe(
      catchError(error => {
        console.error('Error liking review:', error);
        return of({});
      })
    );
  }

  dislikeReview(reviewId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reviews/${reviewId}/dislike`, {}).pipe(
      catchError(error => {
        console.error('Error disliking review:', error);
        return of({});
      })
    );
  }

  getComments(reviewId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/reviews/${reviewId}/comment`).pipe(
      catchError(error => {
        console.error('Error fetching comments:', error);
        return of([]);
      })
    );
  }

  submitComment(reviewId: string, content: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reviews/${reviewId}/comment`, { content }).pipe(
      catchError(error => {
        console.error('Error submitting comment:', error);
        return of({});
      })
    );
  }
}
