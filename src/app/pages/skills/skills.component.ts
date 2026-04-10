import { Component, inject, OnInit, signal } from '@angular/core';
import { SkillCategory } from '../../interfaces/skills';
import { Constants } from '../../models/constants';
import { SkillsService } from '../../services/skills/skills.service';

@Component({
  selector: 'app-skills',
  imports: [],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss'
})
export class SkillsComponent implements OnInit {
  categories: any[] = [];
  skillsService = inject(SkillsService);
  isLoading = signal(true); // 1. Added loading signal

  ngOnInit(): void {
    // this.categories = Constants.TECH_STACK;
    this.getSkills();
  }

  getSkills(): void {
    this.isLoading.set(true);
    this.skillsService.getSkills().subscribe({
      next: (res: any) => {
        if(res?.success){
          const groupedSkills = res.skills.reduce((acc: any[], skill: any) => {
            const index = acc.findIndex((c: any) => c.title === skill.category);
            if (index > -1) {
              acc[index].skills.push(skill);
            } else {
              acc.push({ title: skill.category, skills: [skill] });
            }
            return acc;
          }, []);
          this.categories = groupedSkills;
        }
        this.isLoading.set(false);
      },
      error: (err: any) => {
        // alert(err?.message);
        this.isLoading.set(false);
      }
    });
  }
  
}
