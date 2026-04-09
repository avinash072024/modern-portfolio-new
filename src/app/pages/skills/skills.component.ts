import { Component, inject, OnInit } from '@angular/core';
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

  ngOnInit(): void {
    // this.categories = Constants.TECH_STACK;
    this.getSkills();
  }

  getSkills(): void {
    this.skillsService.getSkills().subscribe({
      next: (res: any) => {
        if(res?.success){
          // Group skills by category based on Constants.TECH_STACK order
          // const categoryOrder = [
          //   'Frontend Development',
          //   'Backend & Database',
          //   'Tools & Design',
          //   'Version Control & DevOps',
          //   'Payment Gateways'
          // ];
          
          const groupedSkills = res.skills.reduce((acc: any[], skill: any) => {
            const index = acc.findIndex((c: any) => c.title === skill.category);
            if (index > -1) {
              acc[index].skills.push(skill);
            } else {
              acc.push({ title: skill.category, skills: [skill] });
            }
            return acc;
          }, []);

          // Sort categories by predefined order
          // groupedSkills.sort((a: any, b: any) => {
          //   const indexA = categoryOrder.indexOf(a.title);
          //   const indexB = categoryOrder.indexOf(b.title);
          //   return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
          // });

          this.categories = groupedSkills;
        } else {
          // alert(res?.message);
        }
      },
      error: (err: any) => {
        // alert(err?.message);
      }
    });
  }
  
}
