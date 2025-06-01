import {Component, EventEmitter, Output} from '@angular/core';
import {SearchableInputComponent} from "../searchable-input/searchable-input.component";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {ReviewService} from "../reviews/service/review.service";


@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [
    SearchableInputComponent,
    FormsModule,
    MatButtonModule, MatDividerModule, MatIconModule, ReactiveFormsModule
  ],
  templateUrl: './review-form.component.html',
  styleUrl: './review-form.component.css'
})
export class ReviewFormComponent {
  @Output() reviewSubmitted = new EventEmitter<boolean>();
  reviewForm: FormGroup;
  universityId: any;
  page : number = 0;
  size : number = 10;

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService
  ) {
    this.reviewForm = this.fb.group({
      instituteId: [null, Validators.required],
      description: ['', [Validators.required]],
      rating: [0,]
    });
  }

  onUniversitySelect($event: any) {
    this.reviewForm.patchValue({
      instituteId: $event.id
    });
    this.universityId = $event.id;
  }


  onSubmit() {
    const reviewData: any = this.reviewForm.value;

    this.reviewService.submitReview(reviewData,this.page, this.size).subscribe({
      next: () => {
        this.resetForm();
        this.reviewSubmitted.emit(true);
      },
      error: (err) => {
        console.error('Error submitting review:', err);
      }
    });
  }

  resetForm() {
    this.universityId = null;
    this.reviewForm.reset({
      instituteId: null,
      description: '',
      rating: 0
    });
  }
}
