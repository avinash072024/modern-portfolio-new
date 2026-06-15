import { Component, inject, OnInit, signal } from '@angular/core';
import { CtaComponent } from "../../components/cta/cta.component";
import { RouterLink } from "@angular/router";
import { AboutService } from '../../services/about/about.service';
import { forkJoin } from 'rxjs';
import { ExperienceService } from '../../services/experience/experience.service';

export interface Experience {
  id: number,
  year: string,
  designation: string,
  company: string
}

export interface Education {
  id: number,
  year: string,
  degree: string,
  school: string
}

@Component({
  selector: 'app-about',
  imports: [CtaComponent, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {
  isLoading = signal(true);
  aboutService = inject(AboutService);
  experienceService = inject(ExperienceService);
  totalExperience: number = 0;

  techStack = [
    { name: 'Angular', icon: 'bi-patch-check', level: '95%' },
    { name: 'TypeScript', icon: 'bi-code-slash', level: '90%' },
    { name: 'Bootstrap', icon: 'bi-bootstrap', level: '95%' },
    { name: 'Node.js', icon: 'bi-server', level: '80%' },
    { name: 'Firebase', icon: 'bi-cloud', level: '85%' },
    { name: 'UI/UX', icon: 'bi-palette', level: '88%' }
  ];

  experiences: any;
  education: any;

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.isLoading.set(true);
    forkJoin({
      education: this.aboutService.getEducation(),
      experience: this.aboutService.getExperience(),
      experienceRes: this.experienceService.getExperience()
    }).subscribe({
      next: (res: any) => {
        // Access the results using the keys defined above
        this.education = res.education?.educations || res.education || [];
        this.experiences = res.experience?.experiences || res.experience || [];
        this.totalExperience = res.experienceRes?.totalExperience || 0; 
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.isLoading.set(false);
      },
    });
  }
}