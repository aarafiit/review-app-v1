import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {SearchableInputComponent} from "../searchable-input/searchable-input.component";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {ReviewService} from "../reviews/service/review.service";
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from "@angular/router";
import {ReviewType} from "../Enum/ReviewType";
import {UniversitySearch} from "../model/search.model";
import {log} from "@angular-devkit/build-angular/src/builders/ssr-dev-server";

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [
    SearchableInputComponent,
    FormsModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './review-form.component.html',
  styleUrl: './review-form.component.css'
})
export class ReviewFormComponent {
  @Output() reviewSubmitted = new EventEmitter<boolean>();

  reviewForm: FormGroup | any;
  universitySearch: UniversitySearch = new UniversitySearch();
  universityId?: any;
  page: number = 0;
  size: number = 10;
  isSubmitting: boolean = false;
  reviewTypes: any = Object.values(ReviewType);

  // Text formatting states
  isBold: boolean = false;
  isItalic: boolean = false;
  isUnderline: boolean = false;


  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService,
    private router: Router
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    this.reviewForm = this.fb.group({
      instituteId: [null, Validators.required],
      reviewType: [null, Validators.required],
      title: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(50)]],
      rating: [0],
      agreeTerms: [false, Validators.requiredTrue]
    });
  }

  onUniversitySelect($event: any) {
    this.reviewForm.patchValue({
      instituteId: $event.id
    });
    this.universitySearch = $event;
    this.universityId = $event.id;
    console.log(this.universityId);
  }

  // Character count functionality
  getCharacterCount(fieldName: string): number {
    const field = this.reviewForm.get(fieldName);
    return field?.value ? field.value.length : 0;
  }

  // Get character count class for styling
  getCharacterCountClass(fieldName: string, maxLength: number): string {
    const count = this.getCharacterCount(fieldName);
    const percentage = (count / maxLength) * 100;

    if (percentage >= 90) return 'character-count at-limit';
    if (percentage >= 75) return 'character-count near-limit';
    return 'character-count';
  }

  // Text formatting methods

  private insertText(text: string) {
    const textarea = document.getElementById('description') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = this.reviewForm.get('description')?.value || '';

      const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
      this.reviewForm.patchValue({ description: newValue });

      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.setSelectionRange(start + text.length, start + text.length);
        textarea.focus();
      }, 0);
    }
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.reviewForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.reviewForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return this.getRequiredFieldMessage(fieldName);
      }
      if (field.errors['minlength']) {
        return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
      }
      if (field.errors['requiredTrue']) {
        return 'You must agree to the terms and conditions';
      }
    }
    return '';
  }

  private getRequiredFieldMessage(fieldName: string): string {
    const messages: { [key: string]: string } = {
      'instituteId': 'Please select a university',
      'reviewType': 'Please select a review type',
      'description': 'Description is required',
      'agreeTerms': 'You must agree to the terms and conditions'
    };
    return messages[fieldName] || 'This field is required';
  }

  onSubmit() {
    if (this.reviewForm.invalid) {
      // Mark all fields as touched to show validation errors
      this.markAllFieldsAsTouched();
      return;
    }

    this.isSubmitting = true;
    const reviewData: any = {
      ...this.reviewForm.value,
      universityId: this.universityId,
      universityName: this.universitySearch.name
    };

    this.reviewService.submitReview(reviewData, this.page, this.size).subscribe({
      next: (response) => {
        console.log('Review submitted successfully:', response);
        this.resetForm();
        this.reviewSubmitted.emit(true);
        this.isSubmitting = false;

        // Navigate to home page after successful submission
        this.router.navigate(['/']);

        // You can add a success notification here
        // this.notificationService.success('Your story has been submitted successfully!');
      },
      error: (err) => {
        console.error('Error submitting review:', err);
        this.isSubmitting = false;

        // You can add an error notification here
        // this.notificationService.error('Failed to submit your story. Please try again.');
      }
    });
  }

  private markAllFieldsAsTouched() {
    Object.keys(this.reviewForm.controls).forEach(key => {
      this.reviewForm.get(key)?.markAsTouched();
    });
  }

  @ViewChild('description') descriptionElement!: ElementRef;

  resetForm() {
    this.universitySearch = new UniversitySearch();
    this.isSubmitting = false;
    this.isBold = false;
    this.isItalic = false;
    this.isUnderline = false;
    this.universityId = null;

    this.reviewForm.reset({
      instituteId: null,
      reviewType: null,
      title: '',
      description: '',
      rating: 0,
      agreeTerms: false
    });

    // Manually clear contenteditable div
    if (this.descriptionElement?.nativeElement) {
      this.descriptionElement.nativeElement.innerHTML = '';
    }
  }


  // Utility method to check if form is ready to submit
  get isFormValid(): boolean {
    return this.reviewForm.valid && !this.isSubmitting;
  }

  // Method to handle back navigation
  goBack() {
    // Implement navigation logic here
    // this.router.navigate(['/reviews']);
    console.log('Navigate back to reviews');
  }



// Format actions using execCommand
  toggleBold() {
    this.isBold = !this.isBold;
    this.formatText('bold');
  }

  toggleItalic() {
    this.isItalic = !this.isItalic;
    this.formatText('italic');
  }

  toggleUnderline() {
    this.isUnderline = !this.isUnderline;
    this.formatText('underline');
  }

  insertBulletList() {
    this.formatText('insertUnorderedList');
  }

  insertNumberedList() {
    this.formatText('insertOrderedList');
  }

  private formatText(command: string) {
    document.execCommand(command, false);
  }


  @ViewChild('description', { static: false }) descriptionEl!: ElementRef;

  charCount = 0;
  maxCharCount = 1000; // or any limit you want

  ngAfterViewInit() {
    const initialValue = this.reviewForm.get('description')?.value || '';
    this.descriptionEl.nativeElement.innerHTML = initialValue;
    this.charCount = this.getPlainText(initialValue).length;
  }

// Handle content change
  onContentChange(event: Event): void {
    const content = (event.target as HTMLElement).innerHTML;
    const plainText = this.getPlainText(content);

    this.charCount = plainText.length;

    this.reviewForm.patchValue({ description: content });
  }

// Utility: strip HTML tags to count characters correctly
  getPlainText(html: string): string {
    const tempEl = document.createElement('div');
    tempEl.innerHTML = html;

    // Strip invisible characters like newlines, non-breaking spaces, etc.
    const text = tempEl.innerText || tempEl.textContent || '';
    return text.replace(/[\n\r\u00A0]/g, '').trim(); // \u00A0 = &nbsp;
  }

  UniversitySearchResultFormatter = (result: UniversitySearch) => {
    return '['+ result.alias?.toUpperCase()+']'+ ' '+ result.name.toUpperCase();
  };



  protected readonly ReviewType = ReviewType;
  protected readonly Symbol = Symbol;
  protected readonly Math = Math;
}
