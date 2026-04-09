export interface Skill {
    name: string;
    icon: string;
    level: number;
    color: string;
}

export interface SkillCategory {
  title: string;
  skills: Skill;
}