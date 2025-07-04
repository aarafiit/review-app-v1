import {RouterModule, Routes} from '@angular/router';
import {ReviewListComponent} from "./review-list/review-list.component";
import {NgModule} from "@angular/core";
import {ReviewsComponent} from "./reviews/reviews.component";
import {ReviewFormComponent} from "./review-form/review-form.component";
import {ReviewDetailsComponent} from "./review-details/review-details.component";
import {AnalyticsComponent} from "./analytics/analytics.component";

export const routes: Routes = [
  {
    path: 'home',
    component: ReviewListComponent
  },
  {
    path: '',
    component: ReviewListComponent
  },
  {
    path: 'share-story',
    component: ReviewFormComponent
  },
  {
    path: 'review/:id',
    component: ReviewDetailsComponent
  },
  {
    path: 'analytics',
    component: AnalyticsComponent
  }
];
