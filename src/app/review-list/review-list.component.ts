import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Observable, Subject, catchError, of, takeUntil, debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { MatPaginator, PageEvent, MatPaginatorModule } from "@angular/material/paginator";
import { Review } from "../model/Review";
import { ReviewService } from "../reviews/service/review.service";
import { Router, RouterModule } from "@angular/router";
import { SearchableInputComponent } from "../searchable-input/searchable-input.component";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatTooltipModule } from "@angular/material/tooltip";
import { SafeHtmlPipe } from "../safe-html.pipe";

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
  currentSearchTerm = '';
  private subscription = new Subscription();

  constructor(
    private reviewService: ReviewService,
    private router: Router
  ) {}

  reviews: Review[] = [];

  ngOnInit() {
    this.loadReviews();
    this.subscribeToSearch();
  }

  ngOnDestroy() {
    // Clean up subscriptions to prevent memory leaks
    this.subscription.unsubscribe();
  }

  loadReviews() {
    this.isLoading = true;
    const reviewsSub = this.reviewService.reviews$.subscribe(response => {
      if (response) {
        console.log('Reviews updated:', response.content);
        this.reviewList = response.content;
        this.totalItems = response.totalElements;
        this.pageSize = response.size;
        this.currentPage = response.number;
        this.isLoading = false;
      }
    });
    this.subscription.add(reviewsSub);
  }

  // Subscribe to search changes from navbar
  subscribeToSearch() {
    const searchSub = this.reviewService.currentSearch$.subscribe(searchTerm => {
      this.currentSearchTerm = searchTerm;
      console.log('Current search term:', searchTerm);
    });
    this.subscription.add(searchSub);
  }

  onPageChange(event: PageEvent) {
    this.isLoading = true;
    // Use current search term when changing pages
    if (this.currentSearchTerm) {
      this.reviewService.searchReviews(this.currentSearchTerm, event.pageIndex, event.pageSize);
    } else {
      this.reviewService.getAllReviews(event.pageIndex, event.pageSize);
    }
  }

  goToPage(page: number | string) {
    // Ensure page is a number before proceeding
    if (typeof page === 'number' && page >= 0 && page < this.getTotalPages() && page !== this.currentPage) {
      this.isLoading = true;
      // Use current search term when navigating pages
      if (this.currentSearchTerm) {
        this.reviewService.searchReviews(this.currentSearchTerm, page, this.pageSize);
      } else {
        this.reviewService.getAllReviews(page, this.pageSize);
      }
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

  likeReview(reviewId: string): void {
    if (reviewId) {
      this.reviewService.likeReview(reviewId).subscribe({
        next: () => {
          console.log('Review liked successfully');
          // Refresh with current search context
          if (this.currentSearchTerm) {
            this.reviewService.searchReviews(this.currentSearchTerm, this.currentPage, this.pageSize);
          } else {
            this.reviewService.getAllReviews(this.currentPage, this.pageSize);
          }
        },
        error: (err) => console.error('Error liking review:', err)
      });
    }
  }

  dislikeReview(reviewId: string): void {
    if (reviewId) {
      this.reviewService.dislikeReview(reviewId).subscribe({
        next: () => {
          console.log('Review disliked successfully');
          // Refresh with current search context
          if (this.currentSearchTerm) {
            this.reviewService.searchReviews(this.currentSearchTerm, this.currentPage, this.pageSize);
          } else {
            this.reviewService.getAllReviews(this.currentPage, this.pageSize);
          }
        },
        error: (err) => console.error('Error disliking review:', err)
      });
    }
  }

  // Helper method to check if we're currently searching
  get isSearching(): boolean {
    return !!this.currentSearchTerm;
  }

  // Helper method to get search result message
  get searchResultMessage(): string {
    if (this.isSearching) {
      const resultCount = this.totalItems;
      return `Found ${resultCount} result${resultCount !== 1 ? 's' : ''} for "${this.currentSearchTerm}"`;
    }
    return '';
  }

  // Page size change handler
  onPageSizeChange(event: any): void {
    const newPageSize = parseInt(event.target.value);
    this.pageSize = newPageSize;
    this.currentPage = 0; // Reset to first page

    this.isLoading = true;
    if (this.currentSearchTerm) {
      this.reviewService.searchReviews(this.currentSearchTerm, 0, newPageSize);
    } else {
      this.reviewService.getAllReviews(0, newPageSize);
    }
  }

  // Helper method to safely get page number for display
  getPageNumber(page: number | string): number {
    if (typeof page === 'number') {
      return page + 1;
    }
    return 1; // Fallback, though this should never happen for non-ellipsis pages
  }

  // Expose Math for template
  Math = Math;
}
