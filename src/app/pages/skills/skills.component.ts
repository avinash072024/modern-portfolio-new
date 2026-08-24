import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { SkillCategory } from '../../interfaces/skills';
import { Constants } from '../../models/constants';
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
  categories = signal<any[]>([]);
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
      next: (res: any) => {
        if(res?.success){
          const skills = res?.skills;
          const groupedSkills = skills.reduce((acc: any[], skill: any) => {
            const index = acc.findIndex((c: any) => c.title === skill.category);
            if (index > -1) {
              acc[index].skills.push(skill);
            } else {
              acc.push({ title: skill.category, skills: [skill] });
            }
            return acc;
          }, []);
          this.categories.set(groupedSkills);
        }
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

