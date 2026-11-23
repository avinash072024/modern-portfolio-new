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
import { SocketService } from '../../services/socket/socket.service';
import { TooltipDirective } from '../../directives/tooltip.directive';
declare var $: any;

interface SkillsTag {
  id: number;
  label: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, TestimonialsComponent, CtaComponent, TooltipDirective],
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
  dedicationCount: string = '0';
  contactService = inject(ContactService);
  projectService = inject(ProjectsService);
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

        this.dedicationCount = '100%';

      },
      error: (err: any) => {
        console.error(err?.error?.message || 'Failed to load dashboard data');
      }
    });
  }

}