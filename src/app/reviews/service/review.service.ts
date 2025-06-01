import { Injectable } from '@angular/core';

import {BehaviorSubject, Observable, tap} from 'rxjs';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environment/environment.development";

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

  submitReview(reviewData: any, page : number, size : number): Observable<any> {
    return this.http.post(`${this.apiUrl}/reviews`, reviewData).pipe(
      tap(() => this.getAllReviews(page,size))
    );
  }
}
