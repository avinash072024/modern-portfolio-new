import { Component, inject, OnInit, OnDestroy, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TestimonialsComponent } from '../../components/testimonials/testimonials.component';
import { CtaComponent } from '../../components/cta/cta.component';
import { RouterLink } from '@angular/router';
import { ContactService } from '../../services/contact/contact.service';
import { ProjectsService } from '../../services/projects/projects.service';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { ExperienceService } from '../../services/experience/experience.service';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ResumesService } from '../../services/resume/resumes.service';
import { SocketService } from '../../services/socket/socket.service';
declare var $: any;

interface SkillsTag {
  id: number;
  label: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, TestimonialsComponent, CtaComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  // Typing Effect Logic  
  readonly roles: string[] = ['a Frontend Developer', 'a Website Developer', 'an Angular Specialist'];
  displayText = signal<string>('');
  isDownloading = signal<boolean>(false);
  private roleIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  myInformation: any;
  projectsCount: number = 0;
  totalExperience: number = 0;
  contactService = inject(ContactService);
  projectService = inject(ProjectsService);
  resumesService = inject(ResumesService);
  experienceService = inject(ExperienceService);
  socketService = inject(SocketService);
  private platformId = inject(PLATFORM_ID);
  private destroy$ = new Subject<void>();
  resumeAvailable!: boolean;

  dynamicResumeUrl: SafeUrl | null = null;

  skillTags: SkillsTag[] = [
    { id: 1, label: 'Angular' },
    { id: 2, label: 'TypeScript' },
    { id: 3, label: 'RxJS' },
    { id: 4, label: 'HTML5 / CSS3' },
    { id: 5, label: 'SCSS / SASS' },
    { id: 6, label: 'Angular Material' },
    { id: 7, label: 'REST APIs' },
    { id: 8, label: 'Node.js' },
    { id: 9, label: 'Bootstrap' },
    { id: 10, label: 'Tailwind CSS' },
    { id: 11, label: 'Git' }
  ];

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.type();
    }
    this.loadDashboardData();
    this.subscribeToSocketUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToSocketUpdates(): void {
    this.socketService
      .onRefreshOrDataUpdated(['contact', 'projects', 'project', 'experience'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadDashboardData();
      });
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
      typeSpeed = 10;
    }

    setTimeout(() => this.type(), typeSpeed);
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
        console.error(err?.error?.message || 'Failed to load dashboard data');
      }
    });
  }

  downloadResume(): void {
    this.isDownloading.set(true);
    this.resumesService.getATSResume().subscribe({
      next: (blob: Blob) => {

        const blobUrl = window.URL.createObjectURL(blob);
        this.dynamicResumeUrl = this.sanitizer.bypassSecurityTrustUrl(blobUrl);

        const fileName = this.myInformation
          ? `${this.myInformation.firstName || 'Avinash'}_${this.myInformation.lastName || 'Marbhal'}_Resume_Angular.pdf`
          : 'Resume_Angular.pdf';

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        this.isDownloading.set(false);
        this.resumeAvailable = true;
        this.showModal();
      },
      error: (err: any) => {
        console.error('Error fetching ATS resume from API:', err);
        // this.downloadUploadedResume();
        this.isDownloading.set(false);
        this.resumeAvailable = false;
        this.showModal();
      }
    });
  }

  private downloadUploadedResume(): void {
    this.resumesService.getResumes().subscribe({
      next: (res: any) => {
        console.log('API Response:', res);
        if (res?.success !== true || !res?.resumes || res?.resumes.length === 0 || !res?.resumes[0]?.pdfData) {
          this.resumeAvailable = false;
          this.showModal();
          return;
        }

        let base64 = res.resumes[0].pdfData;
        const pureBase64 = base64.includes(',') ? base64.split(',')[1] : base64;

        const byteCharacters = atob(pureBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        const blobUrl = window.URL.createObjectURL(blob);
        this.dynamicResumeUrl = this.sanitizer.bypassSecurityTrustUrl(blobUrl);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = res?.resumes[0].fileName || 'resume.pdf';
        document.body.appendChild(link);
        link.click();
        link.remove();
        this.resumeAvailable = true;
        this.showModal();
      },
      error: (err: any) => {
        console.error('Error fetching uploaded resume from API:', err);
        this.resumeAvailable = false;
        this.showModal();
      }
    });
  }

  private showModal(): void {
    const modalEl = document.getElementById('staticBackdrop');
    if ((window as any).bootstrap && modalEl) {
      const bsModal = new (window as any).bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: false });
      bsModal.show();
    } else if (typeof $ !== 'undefined' && ($ as any)('#staticBackdrop').modal) {
      ($ as any)('#staticBackdrop').modal('show');
    }
  }

}