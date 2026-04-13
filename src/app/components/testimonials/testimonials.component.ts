import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Testimonial } from '../../interfaces/testimonial';
import { TESTIMONIALS } from '../../models/testimonials.data';
import { FeedbackService } from '../../services/feedback/feedback.service';
import { ValidationService } from '../../validations/validation.service';

interface BootstrapModalInstance {
  hide(): void;
}

interface BootstrapModalApi {
  getOrCreateInstance(element: Element): BootstrapModalInstance;
}

interface BootstrapWindow extends Window {
  bootstrap?: {
    Modal?: BootstrapModalApi;
  };
}

@Component({
  selector: 'app-testimonials',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss'
})
export class TestimonialsComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  
  // testimonials: Testimonial[] = TESTIMONIALS;
  testimonials: Testimonial[] = [];
  
  feedbackForm = this.formBuilder.group({
    name: ['', Validators.required],
    organization: ['', Validators.required],
    designation: ['', Validators.required],
    rating: [null as number | null, Validators.required],
    message: ['', Validators.required]
  });
  
  isSubmitting = signal<boolean>(false);
  isSubmitted = signal(false);
  submitError = signal<string>('');
  showToast = signal<boolean>(false);
  toastMessage = signal<string>('Feedback submitted successfully.');
  isLoading = signal<boolean>(true);

  private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly feedbackService: FeedbackService,
    public readonly validationService: ValidationService
  ) { }

  ngOnInit(): void {
    this.getFeedbacks();
  }

  getFeedbacks(): void {
    this.isLoading.set(true); // Start loading
    this.feedbackService.getAllFeedback().subscribe({
      next: (res: any) => {
        if (res?.success) {
          let data = res?.feedback || [];
          this.testimonials = data.filter((item: any) => item.verified === true) || [];
        }
        this.isLoading.set(false); // Stop loading
      },
      error: (err: any) => {
        this.isLoading.set(false); // Stop loading even on error
      }
    })
  }

  getStars(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }

  onFeedbackSubmit(): void {
    this.isSubmitted.set(true);

    if (this.feedbackForm.invalid) {
      Object.values(this.feedbackForm.controls).forEach((control) => control.markAsDirty());
      this.feedbackForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set('');

    const formValue = this.feedbackForm.getRawValue();
    this.feedbackService.createFeedback({
      name: formValue.name ?? '',
      organization: formValue.organization ?? '',
      designation: formValue.designation ?? '',
      rating: formValue.rating ?? 0,
      message: formValue.message ?? ''
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.feedbackForm.reset({ rating: null });
        this.isSubmitted.set(false);
        this.hideFeedbackModal();
        this.triggerToast('Feedback submitted successfully.');
      },
      error: (error: { error?: { message?: string } }) => {
        this.isSubmitting.set(false);
        this.submitError.set(error?.error?.message ?? 'Unable to submit feedback. Please try again.');
      }
    });
  }

  resetFeedbackForm(): void {
    this.feedbackForm.reset({ rating: null });
    this.isSubmitted.set(false);
    this.submitError.set('');
  }

  isControlInvalid(controlName: 'name' | 'organization' | 'designation' | 'rating' | 'message'): boolean {
    const control = this.feedbackForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched || this.isSubmitted());
  }

  closeToast(): void {
    this.showToast.set(false);
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
      this.toastTimeoutId = null;
    }
  }

  ngOnDestroy(): void {
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }
  }

  private hideFeedbackModal(): void {
    const modalElement = document.getElementById('feedbackModal');
    if (!modalElement) {
      return;
    }

    const bootstrapWindow = window as BootstrapWindow;
    const modalApi = bootstrapWindow.bootstrap?.Modal;
    if (!modalApi) {
      return;
    }

    const modal = modalApi.getOrCreateInstance(modalElement);
    modal.hide();
  }

  private triggerToast(message: string): void {
    this.toastMessage.set(message);
    this.showToast.set(true);

    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }

    this.toastTimeoutId = setTimeout(() => {
      this.showToast.set(false);
      this.toastTimeoutId = null;
    }, 4000);
  }
}
