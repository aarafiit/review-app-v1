import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';

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

  constructor(private router: Router) {}

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
      // Navigate to search results page with query parameter
      this.router.navigate(['/universities'], {
        queryParams: { search: this.searchText.trim() }
      });
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
