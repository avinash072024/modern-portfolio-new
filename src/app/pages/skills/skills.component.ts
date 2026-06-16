import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { SkillCategory } from '../../interfaces/skills';
import { Constants } from '../../models/constants';
import { SkillsService } from '../../services/skills/skills.service';
import { CtaComponent } from '../../components/cta/cta.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skills',
  imports: [CtaComponent, CommonModule],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss'
})
export class SkillsComponent implements OnInit {
  categories: any[] = [];
  skillsService = inject(SkillsService);
  isLoading = signal(true);
  activeCategory = signal<string>('All');

  filteredCategories = computed(() => {
    const active = this.activeCategory();
    if (active === 'All') {
      return this.categories;
    }
    return this.categories.filter(cat => cat.title === active);
  });

  ngOnInit(): void {
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
        this.isLoading.set(false);
      }
    });
  }

  setActiveCategory(category: string): void {
    this.activeCategory.set(category);
  }
}

