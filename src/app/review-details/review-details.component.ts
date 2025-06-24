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

  // Error states
  error: string | null = null;
  commentError: string | null = null;

  // Form data
  newComment: string = '';

  // Pagination (if needed)
  totalCommentPages: number = 0;
  totalComments: number = 0;

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

    // Review is valid if it has at least title OR description
    return !!(review.title?.trim() || review.description?.trim());
  }

  /**
   * Load review details and comments
   */
  private loadReviewDetails(): void {
    this.isLoading = true;
    this.error = null;

    const reviewSubscription = this.reviewService.getReviewById(this.reviewId).subscribe({
      next: (review) => {
        console.log('Received review data:', review);

        if (this.isValidReview(review)) {
          this.review = review;
          this.isLoading = false;
          // Load comments using the route param ID, not review.id (which might be null)
          this.loadComments();
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
   * Load comments for the current review
   */
  private loadComments(): void {
    if (!this.reviewId) return;

    this.isLoadingComments = true;
    this.commentError = null;

    const commentsSubscription = this.reviewService.getComments(this.reviewId).subscribe({
      next: (response) => {
        try {
          // Handle both paginated and simple array responses
          if (response && response.content) {
            this.comments = response.content || [];
            this.totalCommentPages = response.totalPages || 0;
            this.totalComments = response.totalElements || 0;
          } else if (Array.isArray(response)) {
            this.comments = response;
            this.totalComments = response.length;
          } else {
            this.comments = [];
            this.totalComments = 0;
          }

          console.log('Comments loaded successfully:', this.comments);
          this.isLoadingComments = false;
        } catch (error) {
          console.error('Error processing comments response:', error);
          this.commentError = 'Failed to process comments';
          this.isLoadingComments = false;
        }
      },
      error: (err) => {
        console.error('Error loading comments:', err);
        this.commentError = 'Failed to load comments';
        this.comments = [];
        this.totalComments = 0;
        this.isLoadingComments = false;
      }
    });

    this.subscriptions.add(commentsSubscription);
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
        console.log('Comment submitted successfully');

        // Clear the form
        this.newComment = '';
        this.isSubmittingComment = false;

        // Reload comments to show the new comment
        this.loadComments();
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
