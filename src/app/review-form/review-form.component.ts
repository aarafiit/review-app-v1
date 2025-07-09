import {Component, ElementRef, EventEmitter, Output, ViewChild, AfterViewInit} from '@angular/core';
import {SearchableInputComponent} from "../searchable-input/searchable-input.component";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors} from "@angular/forms";
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {ReviewService} from "../reviews/service/review.service";
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from "@angular/router";
import {ReviewType} from "../Enum/ReviewType";
import {UniversitySearch} from "../model/search.model";

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
export class ReviewFormComponent implements AfterViewInit {
  @Output() reviewSubmitted = new EventEmitter<boolean>();
  @ViewChild('description', { static: false }) descriptionEl!: ElementRef;

  reviewForm: FormGroup;
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

  // Character counts
  titleCharCount = 0;
  descriptionCharCount = 0;
  maxTitleLength = 100;
  maxDescriptionLength = 1000;
  minDescriptionLength = 50;

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService,
    private router: Router
  ) {
    this.reviewForm = this.initializeForm();
  }

  ngAfterViewInit() {
    // Initialize description element if it exists
    if (this.descriptionEl?.nativeElement) {
      const initialValue = this.reviewForm.get('description')?.value || '';
      this.descriptionEl.nativeElement.innerHTML = initialValue;
      this.updateDescriptionCharCount();
    }
  }

  private initializeForm(): FormGroup {
    return this.fb.group({
      instituteId: [null, Validators.required],
      reviewType: [null, Validators.required],
      title: ['', [Validators.required, this.trimmedLengthValidator(1, this.maxTitleLength)]],
      description: ['', [Validators.required, this.trimmedLengthValidator(this.minDescriptionLength, this.maxDescriptionLength)]],
      rating: [0],
      agreeTerms: [false, Validators.requiredTrue]
    });
  }

  // Custom validator for trimmed length
  private trimmedLengthValidator(minLength: number, maxLength: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Let required validator handle empty values
      }

      const trimmedValue = this.getPlainText(control.value.toString()).trim();

      if (trimmedValue.length === 0) {
        return { required: true };
      }

      if (trimmedValue.length < minLength) {
        return { minlength: { requiredLength: minLength, actualLength: trimmedValue.length } };
      }

      if (trimmedValue.length > maxLength) {
        return { maxlength: { requiredLength: maxLength, actualLength: trimmedValue.length } };
      }

      return null;
    };
  }

  onUniversitySelect($event: any) {
    this.reviewForm.patchValue({
      instituteId: $event.id
    });
    this.universitySearch = $event;
    this.universityId = $event.id;
  }

  // Character count functionality with trimmed text
  getCharacterCount(fieldName: string): number {
    const field = this.reviewForm.get(fieldName);
    if (!field?.value) return 0;

    const plainText = this.getPlainText(field.value.toString());
    return plainText.trim().length;
  }

  // Get character count class for styling
  getCharacterCountClass(fieldName: string, maxLength: number): string {
    const count = this.getCharacterCount(fieldName);
    const percentage = (count / maxLength) * 100;

    if (percentage >= 100) return 'at-limit';
    if (percentage >= 90) return 'near-limit';
    return '';
  }

  // Text formatting methods
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
    // Update form value after formatting
    setTimeout(() => this.updateDescriptionFromElement(), 0);
  }

  // Handle content change with character limit enforcement
  onContentChange(event: Event): void {
    const element = event.target as HTMLElement;
    const content = element.innerHTML;
    const plainText = this.getPlainText(content);

    // Enforce character limit
    if (plainText.trim().length > this.maxDescriptionLength) {
      // Prevent further input by reverting to previous valid content
      const currentValue = this.reviewForm.get('description')?.value || '';
      element.innerHTML = currentValue;

      // Restore cursor position at the end
      this.setCursorToEnd(element);
      return;
    }

    this.reviewForm.patchValue({ description: content });
    this.updateDescriptionCharCount();
  }

  // Handle keypress to prevent exceeding character limit
  onDescriptionKeypress(event: KeyboardEvent): void {
    const element = event.target as HTMLElement;
    const currentText = this.getPlainText(element.innerHTML);

    // Allow backspace, delete, and other control keys
    if (event.key === 'Backspace' || event.key === 'Delete' || event.ctrlKey || event.metaKey) {
      return;
    }

    // Prevent typing if at character limit
    if (currentText.trim().length >= this.maxDescriptionLength) {
      event.preventDefault();
    }
  }

  // Handle title input with character limit
  onTitleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value.trim().length > this.maxTitleLength) {
      // Truncate to max length
      const trimmedValue = value.substring(0, this.maxTitleLength);
      input.value = trimmedValue;
      this.reviewForm.patchValue({ title: trimmedValue });
    }

    this.titleCharCount = value.trim().length;
  }

  private updateDescriptionCharCount(): void {
    const value = this.reviewForm.get('description')?.value || '';
    this.descriptionCharCount = this.getPlainText(value).trim().length;
  }

  private updateDescriptionFromElement(): void {
    if (this.descriptionEl?.nativeElement) {
      const content = this.descriptionEl.nativeElement.innerHTML;
      this.reviewForm.patchValue({ description: content });
      this.updateDescriptionCharCount();
    }
  }

  private setCursorToEnd(element: HTMLElement): void {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  // Utility: strip HTML tags to count characters correctly
  getPlainText(html: string): string {
    const tempEl = document.createElement('div');
    tempEl.innerHTML = html;
    const text = tempEl.innerText || tempEl.textContent || '';
    return text.replace(/[\n\r\u00A0]/g, '').trim();
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.reviewForm.get(fieldName);
    return !!(field?.invalid && (field?.touched || field?.dirty));
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
      if (field.errors['maxlength']) {
        return `Maximum ${field.errors['maxlength'].requiredLength} characters allowed`;
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
      'title': 'Title is required',
      'description': 'Description is required',
      'agreeTerms': 'You must agree to the terms and conditions'
    };
    return messages[fieldName] || 'This field is required';
  }

  onSubmit() {
    // Mark all fields as touched to show validation errors
    this.markAllFieldsAsTouched();

    if (this.reviewForm.invalid) {
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
        this.resetForm();
        this.reviewSubmitted.emit(true);
        this.isSubmitting = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Error submitting review:', err);
        this.isSubmitting = false;
      }
    });
  }

  private markAllFieldsAsTouched() {
    Object.keys(this.reviewForm.controls).forEach(key => {
      this.reviewForm.get(key)?.markAsTouched();
    });
  }

  resetForm() {
    this.universitySearch = new UniversitySearch();
    this.isSubmitting = false;
    this.isBold = false;
    this.isItalic = false;
    this.isUnderline = false;
    this.universityId = null;
    this.titleCharCount = 0;
    this.descriptionCharCount = 0;

    this.reviewForm.reset({
      instituteId: null,
      reviewType: null,
      title: '',
      description: '',
      rating: 0,
      agreeTerms: false
    });

    // Clear contenteditable div
    if (this.descriptionEl?.nativeElement) {
      this.descriptionEl.nativeElement.innerHTML = '';
    }
  }

  // Check if form is ready to submit
  get isFormValid(): boolean {
    // Additional check for trimmed content
    const titleValue = this.reviewForm.get('title')?.value || '';
    const descriptionValue = this.reviewForm.get('description')?.value || '';

    const titleTrimmed = titleValue.toString().trim();
    const descriptionTrimmed = this.getPlainText(descriptionValue.toString()).trim();

    const hasValidContent = titleTrimmed.length > 0 &&
      descriptionTrimmed.length >= this.minDescriptionLength &&
      descriptionTrimmed.length <= this.maxDescriptionLength;

    return this.reviewForm.valid && !this.isSubmitting && hasValidContent;
  }

  UniversitySearchResultFormatter = (result: UniversitySearch) => {
    return '['+ result.alias?.toUpperCase()+']'+ ' '+ result.name.toUpperCase();
  };

  protected readonly ReviewType = ReviewType;
  protected readonly Math = Math;
}
