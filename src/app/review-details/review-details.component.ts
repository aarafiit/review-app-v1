import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReviewService } from '../reviews/service/review.service';
import { Review } from '../model/Review';

@Component({
  selector: 'app-review-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './review-details.component.html',
  styleUrl: './review-details.component.css'
})
export class ReviewDetailsComponent implements OnInit {
  review: Review | null = null;
  isLoading = true;
  error: string | null = null;

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
      },
      error: (err) => {
        console.error('Error loading review:', err);
        this.error = 'Failed to load review details';
        this.isLoading = false;
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
