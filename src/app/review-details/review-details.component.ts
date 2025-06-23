import { Component, OnInit } from '@angular/core';
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
import { ReviewService, Comment } from '../reviews/service/review.service';
import { Review } from '../model/Review';

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
export class ReviewDetailsComponent implements OnInit {
  review: Review | null = null;
  isLoading = true;
  error: string | null = null;
  comments: Comment[] = [];
  newComment: string = '';
  isLoadingComments = false;
  commentError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const reviewId = params.get('id');
      if (reviewId) {
        this.loadReview(reviewId);
      } else {
        this.error = 'Review ID not found';
        this.isLoading = false;
      }
    });
  }

  loadReview(id: string): void {
    this.isLoading = true;
    this.reviewService.getReviewById(id).subscribe({
      next: (review) => {
        this.review = review;
        this.isLoading = false;
        this.loadComments(id);
      },
      error: (err) => {
        console.error('Error loading review:', err);
        this.error = 'Failed to load review details';
        this.isLoading = false;
      }
    });
  }

  loadComments(reviewId: string): void {
    this.isLoadingComments = true;
    this.reviewService.getComments(reviewId).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.isLoadingComments = false;
      },
      error: (err) => {
        console.error('Error loading comments:', err);
        this.commentError = 'Failed to load comments';
        this.isLoadingComments = false;
      }
    });
  }

  submitComment(): void {
    if (!this.review?.id || !this.newComment.trim()) return;

    this.reviewService.submitComment(this.review.id, this.newComment).subscribe({
      next: () => {
        // Reload comments after successful submission
        this.loadComments(this.review!.id!);
        this.newComment = ''; // Clear the comment input
      },
      error: (err) => {
        console.error('Error submitting comment:', err);
        this.commentError = 'Failed to submit comment';
      }
    });
  }

  getStarArray(rating: number): number[] {
    return Array(rating ? Math.round(rating) : 0).fill(0);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
