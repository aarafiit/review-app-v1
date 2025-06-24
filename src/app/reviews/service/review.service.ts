import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../environment/environment.development";
import { Review } from '../../model/Review';
import { Comment } from "../../model/comment.model";

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = environment.apiUrl;
  private reviewsSubject = new BehaviorSubject<any>(null);
  public reviews$ = this.reviewsSubject.asObservable();

  // Add a subject to track current search term
  private currentSearchSubject = new BehaviorSubject<string>('');
  public currentSearch$ = this.currentSearchSubject.asObservable();

  constructor(private http: HttpClient) {
    this.getAllReviews(0, 10);
  }

  getAllReviews(page: number, size: number, searchText?: string) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (searchText && searchText.trim()) {
      params = params.set('searchParam', searchText.trim());
    }

    this.http.get<any>(`${this.apiUrl}/reviews`, { params }).subscribe({
      next: (reviews) => {
        this.reviewsSubject.next(reviews);
        // Update current search term
        this.currentSearchSubject.next(searchText || '');
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        // On error, emit empty result but keep the search term
        this.reviewsSubject.next({
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: page,
          size: size
        });
      }
    });
  }

  // New method specifically for search
  searchReviews(searchParam: string, page: number = 0, size: number = 10) {
    console.log('Searching reviews with param:', searchParam);
    this.getAllReviews(page, size, searchParam);
  }

  // Method to clear search and get all reviews
  clearSearch(page: number = 0, size: number = 10) {
    console.log('Clearing search, loading all reviews');
    this.getAllReviews(page, size);
  }

  getReviewById(id: string): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/reviews/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching review:', error);
        return of({} as Review);
      })
    );
  }

  submitReview(reviewData: any, page: number, size: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/reviews`, reviewData).pipe(
      tap(() => {
        // After submitting, reload with current search if any
        const currentSearch = this.currentSearchSubject.value;
        this.getAllReviews(page, size, currentSearch);
      })
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

  getComments(reviewId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reviews/${reviewId}/comment`).pipe(
      catchError(error => {
        console.error('Error fetching comments:', error);
        return of({
          content: [],
          totalPages: 0,
          totalElements: 0,
          number: 0,
          size: 0,
          first: true,
          last: true
        });
      })
    );
  }

  submitComment(reviewId: string, comment: Comment): Observable<any> {
    return this.http.post(`${this.apiUrl}/reviews/${reviewId}/comment`, comment);
  }
}
