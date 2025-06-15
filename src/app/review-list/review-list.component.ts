import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Observable, Subject, catchError, of, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
// import { ReviewsService, ReviewFilters } from './reviews.service';
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {Review} from "../model/Review";
import {ReviewService} from "../reviews/service/review.service";
import {RouterModule} from "@angular/router";
import {SearchableInputComponent} from "../searchable-input/searchable-input.component";
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {MatIconModule} from "@angular/material/icon";

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule
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
  reviews: Review[] = [];

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
    // this.reviewService.getAllReviews(event.pageIndex, event.pageSize);
  }

}

