import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { ReviewService } from "../reviews/service/review.service";

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  searchText = '';
  activeTab = 'home';

  constructor(
    private router: Router,
    private reviewService: ReviewService
  ) {}

  ngOnInit() {
    // Set active tab based on current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.url;
      if (url.includes('/home')) {
        this.activeTab = 'home';
      } else if (url.includes('/universities')) {
        this.activeTab = 'universities';
      } else if (url.includes('/reviews')) {
        this.activeTab = 'reviews';
      }
    });
  }

  onSearch() {
    if (this.searchText.trim()) {
      // Navigate to home page if not already there
      if (this.router.url !== '/' && this.router.url !== '/home') {
        this.router.navigate(['/']);
      }

      // Trigger search in ReviewService with the search parameter
      this.reviewService.searchReviews(this.searchText.trim(), 0, 10);
    } else {
      // If search is empty, load all reviews
      this.reviewService.getAllReviews(0, 10);
    }
  }

  onSearchKeypress(event: any) {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  // Clear search when user clears the input
  onSearchInputChange() {
    if (!this.searchText.trim()) {
      // If search input is cleared, show all reviews
      this.reviewService.getAllReviews(0, 10);
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
