import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClient, HttpClientModule, HttpHeaders} from '@angular/common/http';
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
import {SafeHtmlPipe} from "../safe-html.pipe";
import {FingerPrintService} from "../rate-limit/finger-print.service";

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
    DatePipe,
    SafeHtmlPipe
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
  isPageChanging = false; // New loading state for pagination
  isSearching = false; // New loading state for search
  isNavbarSearching = false; // Loading state for navbar search
  searchText = ''; // Track search text
  private subscription = new Subscription();

  constructor(
    private reviewService: ReviewService,
    private router: Router
  ) {
  }
  reviews: Review[] = [];

  ngOnInit() {
    this.loadReviews();

    // Subscribe to navbar search loading state
    const searchLoadingSub = this.reviewService.searchLoading$.subscribe(loading => {
      this.isNavbarSearching = loading;
    });
    this.subscription.add(searchLoadingSub);
  }

  ngOnDestroy() {
    // Clean up subscriptions to prevent memory leaks
    this.subscription.unsubscribe();
  }

  loadReviews() {
    this.isLoading = true;
    const reviewsSub = this.reviewService.reviews$.subscribe(response => {
      if (response) {
        this.reviewList = response.content;
        this.totalItems = response.totalElements;
        this.pageSize = response.size;
        this.currentPage = response.number;

        // Turn off all loading states
        this.isLoading = false;
        this.isPageChanging = false;
        this.isSearching = false;
        this.isNavbarSearching = false;
      }
    });
    this.subscription.add(reviewsSub);
  }

  onPageChange(event: PageEvent) {
    this.isPageChanging = true; // Show page change loading

    // Add artificial delay for better UX
    setTimeout(() => {
      this.reviewService.getAllReviews(event.pageIndex, event.pageSize);
    }, 800); // 800ms delay for page switching
  }

  // Fix for pagination visibility - always show if there's data
  shouldShowPagination(): boolean {
    return this.totalItems > 0;
  }

  goToPage(page: number | string) {
    if (typeof page === 'number' && page >= 0 && page < this.getTotalPages() && page !== this.currentPage) {
      this.isPageChanging = true;

      // Add artificial delay for page navigation
      setTimeout(() => {
        this.reviewService.getAllReviews(page, this.pageSize);
      }, 800); // 800ms delay
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  getPaginationRange(): (number | string)[] {
    const totalPages = this.getTotalPages();
    const currentPage = this.currentPage;
    const range: (number | string)[] = [];

    if (totalPages <= 7) {
      // If we have 7 or fewer pages, show all pages
      for (let i = 0; i < totalPages; i++) {
        range.push(i);
      }
    } else {
      // Always show first page
      range.push(0);

      if (currentPage > 3) {
        // Show ellipsis after first page if current page is far enough
        range.push('...');
      }

      // Calculate start and end of the middle range
      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages - 2, currentPage + 1);

      // Add the middle range
      for (let i = start; i <= end; i++) {
        range.push(i);
      }

      if (currentPage < totalPages - 4) {
        // Show ellipsis before last page if current page is far enough
        range.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        range.push(totalPages - 1);
      }
    }

    return range;
  }

  getStarArray(rating: number): number[] {
    return Array(rating ? Math.round(rating) : 0).fill(0);
  }

  viewReviewDetails(reviewId: string): void {
    if (reviewId) {
      this.router.navigate(['/review', reviewId]);
    }
  }

  userHasLiked = false;

  likeReview(reviewId: string): void {
    if (reviewId) {
      const localAnonId = this.getAnonId();
      this.reviewService.likeReview(reviewId,localAnonId).subscribe({
        next: () => {
          this.userHasLiked = true;
          this.reviewService.getAllReviews(this.currentPage, this.pageSize);
        },
        error: (err) => console.error('Error liking review:', err)
      });
    }
  }

  dislikeReview(reviewId: string): void {
    if (reviewId) {
      this.reviewService.dislikeReview(reviewId).subscribe({
        next: () => {
          // Optionally refresh the reviews list
          this.reviewService.getAllReviews(this.currentPage, this.pageSize);
        },
        error: (err) => console.error('Error disliking review:', err)
      });
    }
  }

  // Helper method to get page number for display (1-based)
  getPageNumber(page: number | string): number {
    return typeof page === 'number' ? page + 1 : 1;
  }

  // Handle page size change
  onPageSizeChange(event: any): void {
    const newPageSize = parseInt(event.target.value);
    this.pageSize = newPageSize;
    this.currentPage = 0; // Reset to first page
    this.isPageChanging = true;

    // Add delay for page size change
    setTimeout(() => {
      this.reviewService.getAllReviews(0, newPageSize);
    }, 800);
  }

  // Search functionality
  onSearch(searchText: string): void {
    this.searchText = searchText;
    this.isSearching = true;
    this.currentPage = 0; // Reset to first page for search

    // Add delay for search
    setTimeout(() => {
      this.reviewService.getAllReviews(0, this.pageSize, searchText);
    }, 1000); // Longer delay for search (1000ms)
  }

  // Clear search
  clearSearch(): void {
    this.searchText = '';
    this.isSearching = true;

    setTimeout(() => {
      this.reviewService.getAllReviews(0, this.pageSize);
    }, 500);
  }

  // Check if any loading state is active
  get isAnyLoading(): boolean {
    return this.isLoading || this.isPageChanging || this.isSearching || this.isNavbarSearching;
  }

  // Math utility for template
  protected readonly Math = Math;
  private readonly storageKey = 'APP_ANON_LOCAL_KEY';
  //get anonId
  getAnonId(): string {
    return localStorage.getItem(this.storageKey) || '';
  }
}
