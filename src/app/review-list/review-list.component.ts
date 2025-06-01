import {Component, OnInit} from '@angular/core';
import {ReviewService} from "../reviews/service/review.service";
import {DatePipe} from "@angular/common";
import {MatPaginator, PageEvent} from "@angular/material/paginator";

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [
    DatePipe,
    MatPaginator
  ],
  templateUrl: './review-list.component.html',
  styleUrl: './review-list.component.css'
})
export class ReviewListComponent implements OnInit {
  reviewList: any ;
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;

  constructor(private reviewService: ReviewService) {
  }

  ngOnInit() {
    this.reviewService.reviews$.subscribe(response => {
      if (response) {
        console.log(response.content);
        this.reviewList = response.content;
        this.totalItems = response.totalElements;
        this.pageSize = response.size;
        this.currentPage = response.number;
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.reviewService.getAllReviews(event.pageIndex, event.pageSize);
  }
}
