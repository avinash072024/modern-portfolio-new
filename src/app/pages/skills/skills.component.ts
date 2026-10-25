import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { Skill, SkillCategory } from '../../interfaces/skills';
import { SkillsService } from '../../services/skills/skills.service';
import { SocketService } from '../../services/socket/socket.service';
import { CtaComponent } from '../../components/cta/cta.component';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-skills',
  imports: [CtaComponent, CommonModule],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss'
})
export class SkillsComponent implements OnInit, OnDestroy {
  categories = signal<SkillCategory[]>([]);
  skillsService = inject(SkillsService);
  socketService = inject(SocketService);
  private destroy$ = new Subject<void>();
  isLoading = signal(true);
  activeCategory = signal<string>('All');

  filteredCategories = computed(() => {
    const active = this.activeCategory();
    const cats = this.categories();
    if (active === 'All') {
      return cats;
    }
    return cats.filter(cat => cat.title === active);
  });

  ngOnInit(): void {
    this.getSkills();
    this.subscribeToSocketUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToSocketUpdates(): void {
    this.socketService
      .onRefreshOrDataUpdated(['skills', 'skill', 'skill-categories', 'skill-category'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getSkills(true, true);
      });
  }

  getSkills(forceRefresh: boolean = false, isSilent: boolean = false): void {
    if (!isSilent) {
      this.categories.set([]);
      this.isLoading.set(true);
    }
    this.skillsService.getSkills(forceRefresh).subscribe({
      next: (res) => {
        if (res.success) {
          const groupedSkills = res.skills
            .filter((skill: Skill) => skill.isActive && skill.category?.isActive)
            .reduce((categories: SkillCategory[], skill: Skill) => {
              const title = skill.category.name;
              const category = categories.find((item) => item.title === title);
              if (category) {
                category.skills.push(skill);
              } else {
                categories.push({ title, skills: [skill] });
              }
              return categories;
            }, []);
          this.categories.set(groupedSkills);
        }
        if (!isSilent) {
          this.isLoading.set(false);
        }
      },
      error: (error: unknown) => {
        console.error('Failed to load skills:', error);
        if (!isSilent) {
          this.isLoading.set(false);
        }
      }
    });
  }

  setActiveCategory(category: string): void {
    this.activeCategory.set(category);
  }
}
