import { Component, inject, OnInit, signal } from '@angular/core';
import { Project } from '../../interfaces/projects';
import { Constants } from '../../models/constants';
import { CtaComponent } from '../../components/cta/cta.component';

import { ProjectsService } from '../../services/projects/projects.service';
declare var bootstrap: any;

@Component({
  selector: 'app-projects',
  imports: [CtaComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit {

  selectedProject: any = null;

  // projects: Project[] = Constants.PROJECTS;
  projects: Project[] = [];

  projectService = inject(ProjectsService);
  isLoading = signal(true); // 1. Add loading signal

  ngOnInit(): void {
    this.getProjects();
  }

  getProjects(): void {
    this.isLoading.set(true);
    this.projectService.getProjects().subscribe({
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

  openProjectModal(project: any) {
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
