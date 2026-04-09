import { Component, inject, OnInit } from '@angular/core';
import { CtaComponent } from "../../components/cta/cta.component";
import { RouterLink } from "@angular/router";
import { AboutService } from '../../services/about/about.service';
import { forkJoin } from 'rxjs';

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

  aboutService = inject(AboutService);

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

  // experience: Experience[] = [
  //   { id: 1, year: '2021 - 2022', designation: 'Junior Web Developer', company: 'MindLine Technologies Pvt. Ltd.' },
  //   { id: 2, year: '2022 - 2024', designation: 'Web Developer', company: 'Bluebenz Digitizations Pvt. Ltd.' },
  //   { id: 3, year: '2024 - Present', designation: 'Senior Web Developer', company: 'Manorama Infosolutions Pvt. Ltd.' }
  // ];

  // education: Education[] = [
  //   { id: 1, year: '2011 - 2012', degree: 'Higher Secondary', school: 'Science Academy' },
  //   { id: 2, year: '2012 - 2015', degree: 'Bachelor of Science', school: 'Shivaji University, Kolhapur' },
  //   { id: 3, year: '2015 - 2018', degree: 'Master of Computer Application', school: 'Shivaji University, Kolhapur' }
  // ]

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    forkJoin({
      education: this.aboutService.getEducation(),
      experience: this.aboutService.getExperience()
    }).subscribe({
      next: (res: any) => {
        // Access the results using the keys defined above
        this.education = res.education?.educations || res.education || [];
        this.experiences = res.experience?.experiences || res.experience || [];
      },
      error: (err: any) => {
        console.error('An error occurred while fetching data', err);
      },
      complete: () => {
        // Optional: Logic to run after both requests finish (e.g., hiding a spinner)
      }
    });
  }
}