import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AboutMe } from '../../interfaces/about-me';
import { Constants } from '../../models/constants';
import { ContactService } from '../../services/contact/contact.service';
import { EmailService } from '../../services/email/email.service';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {

  contactForm!: FormGroup;
  fb = inject(FormBuilder);
  
  isSending = signal(false);
  isSuccess = signal(false);
  // myInformation: AboutMe = Constants.ABOUT_ME;
  myInformation: any;
  contactService = inject(ContactService);
  emailService = inject(EmailService);

  ngOnInit(): void {
    this.initForm();
    this.getContactDetails();
  }

  initForm(): void {
    this.contactForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contact: [''],
      message: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSending.set(true);

      const payload = {
        firstname: this.contactForm.value.firstName,
        lastname: this.contactForm.value.lastName,
        email: this.contactForm.value.email,
        contact: this.contactForm.value.contact,
        message: this.contactForm.value.message
      };

      this.emailService.createMail(payload).subscribe({
        next: (res: any) => {
          this.isSending.set(false);
          if (res?.success) {
            this.isSuccess.set(true);
            this.contactForm.reset();

            // Clear success message after 5 seconds
            setTimeout(() => this.isSuccess.set(false), 5000);
          }
        },
        error: (err: any) => {
          this.isSending.set(false);
          // Try to handle error or alert them
          // alert(err.error?.message || 'Failed to send message.');
        }
      });
    } else {
      this.contactForm.markAllAsTouched();
    }
  }

  getContactDetails(): void {
    this.contactService.getContact().subscribe({
      next: (res: any) => {
        if (res?.success && res?.contact) {
          this.myInformation = res.contact;
        }
      },
      error: (err: any) => {
        // alert(err.error.message || 'Failed to load contact details');
      }
    });
  }
}