import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, FormsModule],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent {
  searchText = '';
  activeTab = 'home';

  onSearch() {
    // Your search logic
  }

  onSearchKeypress(event: any) {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  openShareStory() {
    // Your share story logic
  }
}
