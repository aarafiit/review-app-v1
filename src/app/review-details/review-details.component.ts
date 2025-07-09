import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReviewService } from '../reviews/service/review.service';
import { Review } from '../model/Review';
import { Comment } from "../model/comment.model";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-review-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './review-details.component.html',
  styleUrl: './review-details.component.css'
})
export class ReviewDetailsComponent implements OnInit, OnDestroy {
  // Main data
  review: Review | null = null;
  comments: Comment[] = [];
  reviewId: string = '';

  // Loading states
  isLoading = true;
  isLoadingComments = false;
  isSubmittingComment = false;
  isLoadingMoreComments = false; // New loading state for pagination

  // Error states
  error: string | null = null;
  commentError: string | null = null;

  // Form data
  newComment: string = '';

  // Pagination properties
  currentCommentsPage = 0;
  commentsPageSize = 5; // Show 5 comments per page
  totalCommentPages = 0;
  totalComments = 0;
  hasMoreComments = false;
  isAllCommentsLoaded = false;

  // Subscriptions for cleanup
  private subscriptions: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    // Get review ID from route parameters
    const routeSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.reviewId = id;
        this.loadReviewDetails();
      } else {
        this.error = 'Review ID not found';
        this.isLoading = false;
      }
    });

    this.subscriptions.add(routeSubscription);
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.subscriptions.unsubscribe();
  }

  /**
   * Check if review object has sufficient data to display
   */
  private isValidReview(review: any): boolean {
    if (!review) return false;
    return !!(review.title?.trim() || review.description?.trim());
  }

  /**
   * Load review details and initial comments
   */
  private loadReviewDetails(): void {
    this.isLoading = true;
    this.error = null;

    const reviewSubscription = this.reviewService.getReviewById(this.reviewId).subscribe({
      next: (review) => {

        if (this.isValidReview(review)) {
          this.review = review;
          this.isLoading = false;
          // Load first page of comments
          this.loadComments(0, true);
        } else {
          console.warn('Invalid review data received:', review);
          this.error = 'Review not found or invalid data';
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error loading review:', err);
        this.error = 'Failed to load review details. Please try again.';
        this.isLoading = false;
      }
    });

    this.subscriptions.add(reviewSubscription);
  }

  /**
   * Load comments with pagination support
   */
  private loadComments(page: number = 0, resetComments: boolean = false): void {
    if (!this.reviewId) return;

    this.isLoadingComments = resetComments;
    this.isLoadingMoreComments = !resetComments;
    this.commentError = null;

    const commentsSubscription = this.reviewService.getComments(
      this.reviewId,
      page,
      this.commentsPageSize
    ).subscribe({
      next: (response) => {
        try {

          if (response && response.content) {
            if (resetComments) {
              // Reset comments array for first page or "View Less"
              this.comments = response.content || [];
              this.currentCommentsPage = 0;
            } else {
              // Append new comments for "View More"
              this.comments = [...this.comments, ...(response.content || [])];
              this.currentCommentsPage = page;
            }

            this.totalCommentPages = response.totalPages || 0;
            this.totalComments = response.totalElements || 0;

            // Check if there are more comments to load
            this.hasMoreComments = (this.currentCommentsPage + 1) < this.totalCommentPages;
            this.isAllCommentsLoaded = this.currentCommentsPage >= (this.totalCommentPages - 1);

          } else if (Array.isArray(response)) {
            // Handle non-paginated response (fallback)
            this.comments = resetComments ? response : [...this.comments, ...response];
            this.totalComments = response.length;
            this.hasMoreComments = false;
            this.isAllCommentsLoaded = true;
          } else {
            this.comments = resetComments ? [] : this.comments;
            this.totalComments = 0;
            this.hasMoreComments = false;
            this.isAllCommentsLoaded = true;
          }

          this.isLoadingComments = false;
          this.isLoadingMoreComments = false;
        } catch (error) {
          console.error('Error processing comments response:', error);
          this.commentError = 'Failed to process comments';
          this.isLoadingComments = false;
          this.isLoadingMoreComments = false;
        }
      },
      error: (err) => {
        console.error('Error loading comments:', err);
        this.commentError = 'Failed to load comments';
        if (resetComments) {
          this.comments = [];
          this.totalComments = 0;
        }
        this.hasMoreComments = false;
        this.isAllCommentsLoaded = true;
        this.isLoadingComments = false;
        this.isLoadingMoreComments = false;
      }
    });

    this.subscriptions.add(commentsSubscription);
  }

  /**
   * Load more comments (next page)
   */
  loadMoreComments(): void {
    if (this.hasMoreComments && !this.isLoadingMoreComments) {
      const nextPage = this.currentCommentsPage + 1;
      this.loadComments(nextPage, false);
    }
  }

  /**
   * Load less comments (back to first page only)
   */
  loadLessComments(): void {
    if (!this.isLoadingComments) {
      this.loadComments(0, true);
    }
  }

  /**
   * Handle view more/less button click
   */
  onViewCommentsToggle(): void {
    if (this.isAllCommentsLoaded && this.currentCommentsPage > 0) {
      // Show "View Less" - go back to first page only
      this.loadLessComments();
    } else if (this.hasMoreComments) {
      // Show "View More" - load next page
      this.loadMoreComments();
    }
  }

  /**
   * Get the button text based on current state
   */
  getViewCommentsButtonText(): string {
    if (this.isLoadingMoreComments) {
      return 'Loading...';
    } else if (this.isAllCommentsLoaded && this.currentCommentsPage > 0) {
      return 'View Less';
    } else if (this.hasMoreComments) {
      const remainingComments = this.totalComments - this.comments.length;
      return `View More (${remainingComments} more)`;
    }
    return '';
  }

  /**
   * Check if view comments button should be shown
   */
  shouldShowViewCommentsButton(): boolean {
    return this.totalComments > this.commentsPageSize &&
      (this.hasMoreComments || (this.isAllCommentsLoaded && this.currentCommentsPage > 0));
  }

  /**
   * Submit a new comment
   */
  submitComment(): void {
    // Validation
    if (!this.reviewId || !this.newComment?.trim()) {
      return;
    }

    // Prepare comment data
    const commentData: Comment = {
      comment: this.newComment.trim()
    };

    this.isSubmittingComment = true;
    this.commentError = null;

    const submitSubscription = this.reviewService.submitComment(this.reviewId, commentData).subscribe({
      next: () => {
        // Clear the form
        this.newComment = '';
        this.isSubmittingComment = false;

        // Reload comments from first page to show new comment
        this.loadComments(0, true);
      },
      error: (err) => {
        console.error('Error submitting comment:', err);
        this.commentError = 'Failed to submit comment. Please try again.';
        this.isSubmittingComment = false;
      }
    });

    this.subscriptions.add(submitSubscription);
  }

  /**
   * Generate star array for rating display
   */
  getStarArray(count: number): number[] {
    return Array(Math.max(0, Math.floor(count))).fill(0);
  }

  /**
   * Track function for comment list performance
   */
  trackByCommentId(index: number, comment: Comment): string {
    return comment.id || `comment-${index}`;
  }

  /**
   * Navigate back to reviews list
   */
  goBack(): void {
    this.router.navigate(['/']);
  }

  /**
   * Check if comment form is valid
   */
  get isCommentFormValid(): boolean {
    return !!(this.newComment?.trim() && !this.isSubmittingComment);
  }

  /**
   * Get formatted comment count text
   */
  get commentCountText(): string {
    if (this.totalComments === 0) return 'No comments';
    if (this.totalComments === 1) return '1 comment';
    return `${this.totalComments} comments`;
  }
}
