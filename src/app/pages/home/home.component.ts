import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestimonialsComponent } from '../../components/testimonials/testimonials.component';
import { CtaComponent } from '../../components/cta/cta.component';
import { RouterLink } from '@angular/router';
import { ContactService } from '../../services/contact/contact.service';
import { ProjectsService } from '../../services/projects/projects.service';
import { forkJoin } from 'rxjs';
import { ExperienceService } from '../../services/experience/experience.service';
declare var $: any;

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, TestimonialsComponent, CtaComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  // Typing Effect Logic
  readonly roles = ['Frontend Developer', 'Website Designer', 'Angular Specialist'];
  displayText = signal('');
  private roleIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  myInformation: any;
  projectsCount: number = 0;
  totalExperience: number = 0;
  contactService = inject(ContactService);
  projectService = inject(ProjectsService);
  experienceService = inject(ExperienceService);

  ngOnInit() {
    this.type();
    this.loadDashboardData();
  }

  type() {
    const currentRole = this.roles[this.roleIndex];

    if (this.isDeleting) {
      this.displayText.set(currentRole.substring(0, this.charIndex - 1));
      this.charIndex--;
    } else {
      this.displayText.set(currentRole.substring(0, this.charIndex + 1));
      this.charIndex++;
    }

    let typeSpeed = this.isDeleting ? 50 : 100;

    if (!this.isDeleting && this.charIndex === currentRole.length) {
      typeSpeed = 2000; // Pause at end
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.roleIndex = (this.roleIndex + 1) % this.roles.length;
      typeSpeed = 500;
    }

    setTimeout(() => this.type(), typeSpeed);
  }

  downloadResume(): void {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', 'assets/resume/Avinash-Marbhal-Resume-Angular-Updated.pdf'); // Path to your file
    link.setAttribute('download', 'Avinash-Marbhal-Resume-Angular.pdf'); // Desired filename
    document.body.appendChild(link);
    link.click();
    link.remove();
    const modalEl = document.getElementById('staticBackdrop');
    // Use Bootstrap's JS modal if available, otherwise fallback to jQuery if present
    if ((window as any).bootstrap && modalEl) {
      const bsModal = new (window as any).bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: false });
      bsModal.show();
    } else if (typeof $ !== 'undefined' && $('#staticBackdrop').modal) {
      $('#staticBackdrop').modal('show');
    }
  }

  loadDashboardData(): void {
    forkJoin({
      contactRes: this.contactService.getContact(),
      projectRes: this.projectService.getProjects(),
      experienceRes: this.experienceService.getExperience()
    }).subscribe({
      next: ({ contactRes, projectRes, experienceRes }: any) => {

        // Contact Data
        if (contactRes?.success && contactRes?.contact) {
          this.myInformation = contactRes.contact;
        }

        // Project Data
        if (projectRes?.success && projectRes?.projects) {
          this.projectsCount = projectRes?.count || 0;
        }

        // Experience Data
        if (experienceRes?.success && experienceRes?.experiences) {
          this.totalExperience = experienceRes?.totalExperience || 0;
        }

      },
      error: (err: any) => {
        // Handle common error
        console.error(err?.error?.message || 'Failed to load dashboard data');
      }
    });
  }

}