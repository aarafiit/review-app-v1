import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import {ReviewService} from "../reviews/service/review.service";

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

  constructor(private router: Router,
              private reviewService: ReviewService) {}

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
      // Navigate to universities page first
      this.router.navigate(['/universities'], {
        queryParams: { search: this.searchText.trim() }
      });

      // Trigger search in review service which will show loading in review-list
      this.reviewService.searchReviews(this.searchText.trim());
    } else {
      // If search text is empty, reload the page with all reviews
      this.router.navigate(['/universities']);
      this.reviewService.searchReviews(''); // This will load all reviews
    }
  }

  // Add method to handle search input changes
  onSearchInput() {
    // If user clears the search box, automatically reload
    if (this.searchText.trim() === '') {
      this.router.navigate(['/universities']);
      this.reviewService.searchReviews(''); // Load all reviews
    }
  }

  onSearchKeypress(event: any) {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
