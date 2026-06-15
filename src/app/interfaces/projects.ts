export interface ProjectDescription {
    [key: string]: string;
}

export interface Project {
    title: string;
    category: string;
    date: string;
    desc: ProjectDescription[];
    image: string;
    tools: string[];
    link: string
}