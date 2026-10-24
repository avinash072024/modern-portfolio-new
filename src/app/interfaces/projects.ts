export interface Category {
  _id: string;
  name: string;
}

export interface ProjectDescription {
    [key: string]: string;
}

export interface Project {
    _id: string;
    title: string;
    category: Category;
    completedYear: string;
    desc: ProjectDescription[];
    image: string;
    tools: string[];
    link: string,
    clientName?: string;
    teamSize?: number;
}