import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Observable, Subject, catchError, of, takeUntil, debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
// import { ReviewsService, ReviewFilters } from './reviews.service';
import {MatPaginator, PageEvent, MatPaginatorModule} from "@angular/material/paginator";
import {Review} from "../model/Review";
import {ReviewService} from "../reviews/service/review.service";
import {Router, RouterModule} from "@angular/router";
import {SearchableInputComponent} from "../searchable-input/searchable-input.component";
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {MatIconModule} from "@angular/material/icon";
import {MatCardModule} from "@angular/material/card";
import {MatChipsModule} from "@angular/material/chips";
import {MatTooltipModule} from "@angular/material/tooltip";

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    MatPaginatorModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    DatePipe
  ],
  templateUrl: './review-list.component.html',
  styleUrl: './review-list.component.css'
})
export class ReviewListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  reviewList: any;
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  isLoading = false;
  private subscription = new Subscription();

  constructor(
    private reviewService: ReviewService,
    private router: Router
  ) {
  }
  reviews: Review[] = [];

  ngOnInit() {
    this.loadReviews();
  }

  ngOnDestroy() {
    // Clean up subscriptions to prevent memory leaks
    this.subscription.unsubscribe();
  }

  loadReviews() {
    this.isLoading = true;
    const reviewsSub = this.reviewService.reviews$.subscribe(response => {
      if (response) {
        console.log(response.content);
        this.reviewList = response.content;
        this.totalItems = response.totalElements;
        this.pageSize = response.size;
        this.currentPage = response.number;
        this.isLoading = false;
      }
    });
    this.subscription.add(reviewsSub);
  }

  onPageChange(event: PageEvent) {
    this.isLoading = true;
    this.reviewService.getAllReviews(event.pageIndex, event.pageSize);
  }

  getStarArray(rating: number): number[] {
    return Array(rating ? Math.round(rating) : 0).fill(0);
  }

  viewReviewDetails(reviewId: string): void {
    if (reviewId) {
      this.router.navigate(['/review', reviewId]);
    }
  }
}
