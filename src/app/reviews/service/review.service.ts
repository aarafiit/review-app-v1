import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, tap, catchError, of} from 'rxjs';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environment/environment.development";
import { Review } from '../../model/Review';
import {Comment} from "../../model/comment.model";

@Injectable({
  providedIn: 'root' // This makes the service available application-wide
})
export class ReviewService {
  private apiUrl = environment.apiUrl;
  private reviewsSubject = new BehaviorSubject<any>([]);
  public reviews$ = this.reviewsSubject.asObservable();

  // Add search loading state
  private searchLoadingSubject = new BehaviorSubject<boolean>(false);
  public searchLoading$ = this.searchLoadingSubject.asObservable();

  constructor(private http: HttpClient) {
    this.getAllReviews(0,10);
  }

  getAllReviews(page: number, size: number, searchText?: string) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (searchText && searchText.trim()) {
      params = params.set('searchParam', searchText.trim());
    }

    this.http.get<any>(`${this.apiUrl}/reviews`, { params }).subscribe({
      next: (reviews) => this.reviewsSubject.next(reviews),
      error: (err) => console.error('Error loading reviews:', err)
    });
  }

  // New method specifically for nav-bar search
  searchReviews(searchText: string) {
    // Set search loading state
    this.searchLoadingSubject.next(true);

    // Add artificial delay for search
    setTimeout(() => {
      this.getAllReviews(0, 10, searchText);
      this.searchLoadingSubject.next(false);
    }, 1000); // 1000ms delay for search
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

  // Updated existing method to support pagination
  getComments(reviewId: string, page: number = 0, size: number = 5): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.apiUrl}/reviews/${reviewId}/comment`, { params }).pipe(
      catchError(error => {
        console.error('Error fetching comments:', error);
        // Fallback to a default paginated object
        return of({
          content: [],
          totalPages: 0,
          totalElements: 0,
          number: page,
          size: size,
          first: page === 0,
          last: true
        });
      })
    );
  }

  submitComment(reviewId: string, comment: Comment): Observable<any> {
    return this.http.post(`${this.apiUrl}/reviews/${reviewId}/comment`, comment);
  }
}
