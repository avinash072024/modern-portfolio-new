import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Project } from '../../interfaces/projects';
import { CtaComponent } from '../../components/cta/cta.component';

import { ProjectsService } from '../../services/projects/projects.service';
import { SocketService } from '../../services/socket/socket.service';
import { Subject, takeUntil } from 'rxjs';
declare var bootstrap: any;

@Component({
  selector: 'app-projects',
  imports: [CtaComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit, OnDestroy {

  // selectedProject: Project | null = null;
  selectedProject: Project | any;

  projects: Project[] = [];

  projectService = inject(ProjectsService);
  socketService = inject(SocketService);
  private destroy$ = new Subject<void>();
  isLoading = signal(true); // 1. Add loading signal

  ngOnInit(): void {
    this.getProjects();
    this.subscribeToSocketUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToSocketUpdates(): void {
    this.socketService
      .onRefreshOrDataUpdated(['projects', 'project'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getProjects(true, true);
      });
  }

  getProjects(forceRefresh: boolean = false, isSilent: boolean = false): void {
    if (!isSilent) {
      this.isLoading.set(true);
    }
    this.projectService.getProjects(forceRefresh).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.projects = res?.projects;
        }
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.isLoading.set(false);
      }
    })
  }

  openProjectModal(project: Project) {
    this.selectedProject = project;
    const modalElement = document.getElementById('projectModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  // Add this method to your ProjectsComponent class
  getDescText(descObj: any): string {
    // Extracts the first value found in the object (e.g., line1, line2)
    return Object.values(descObj)[0] as string;
  }

  getLineText(descItem: any): string {
    if (!descItem) return '';
    const values = Object.values(descItem);
    return values.length > 0 ? String(values[0]) : '';
  }
}
