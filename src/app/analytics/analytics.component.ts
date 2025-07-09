import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { AnalyticsService } from "./service/analytics.service";
import { HttpResponse } from "@angular/common/http";

export interface AnalyticsData {
  instituteId: number;
  instituteName: string;
  totalReviews: number;
  totalPositiveReviews: number;
  totalNegativeReviews: number;
  totalMixedReviews: number;
  positiveReviewPercentage: number;
  negativeReviewPercentage: number;
  mixedReviewPercentage: number;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();

  searchParam?: string;
  selectedPeriod: string = 'last30days';
  isLoading: boolean = true;
  error: string | null = null;

  analyticData: AnalyticsData[] = [];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadAnalyticsDashboard();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onPeriodChange(period: string): void {
    this.selectedPeriod = period;
    this.loadAnalyticsDashboard();
  }

  private loadAnalyticsDashboard(): void {
    this.isLoading = true;
    this.error = null;

    const analyticsSubscription = this.analyticsService.getAnalyticsData(this.searchParam).subscribe({
      next: (response: HttpResponse<AnalyticsData[]>) => {
        this.analyticData = response.body || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading analytics data:', error);
        this.error = 'Failed to load analytics data';
        this.isLoading = false;
        this.analyticData = [];
      }
    });

    this.subscriptions.add(analyticsSubscription);
  }

  refreshData(): void {
    this.loadAnalyticsDashboard();
  }

  viewOrganizationDetails(orgId: number): void {
  }

  // Helper method to get organization alias from institute name
  getOrgAlias(instituteName: string): string {
    if (!instituteName) return 'ORG';

    const words = instituteName.split(' ');
    if (words.length >= 2) {
      // Take first letter of first two words
      return words.slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase();
    }
    // If only one word, take first 3 characters
    return instituteName.substring(0, 3).toUpperCase();
  }

  formatPercentage(value: number): string {
    return `${value?.toFixed(1) || '0.0'}%`;
  }

  // Track by function for better performance
  trackByInstituteId(index: number, item: AnalyticsData): number {
    return item.instituteId;
  }
}
