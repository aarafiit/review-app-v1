import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {ReviewFormComponent} from "../review-form/review-form.component";
import {ReviewListComponent} from "../review-list/review-list.component";

@Component({
  selector: 'reviews',
  standalone: true,
  imports: [
    FormsModule,
    ReviewFormComponent,
    ReviewListComponent
  ],
  templateUrl: './reviews.component.html',
  styleUrl: './reviews.component.css'
})
export class ReviewsComponent implements OnInit {
  searchText: any;

  ngOnInit(): void {

  }

  onSearch() {

  }
}
