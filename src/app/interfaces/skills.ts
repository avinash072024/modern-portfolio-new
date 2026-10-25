export interface Skill {
    _id: string;
    name: string;
    icon: string;
    level: number;
    color: string;
    category: SkillCategoryDetails;
    isActive: boolean;
}

export interface SkillCategoryDetails {
    _id: string;
    name: string;
    isActive: boolean;
}

export interface SkillCategory {
    title: string;
    skills: Skill[];
}

export interface SkillsResponse {
    success: boolean;
    count: number;
    skills: Skill[];
}