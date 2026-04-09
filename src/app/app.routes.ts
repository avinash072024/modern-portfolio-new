import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { Constants } from './models/constants';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ServicesComponent } from './pages/services/services.component';
import { SkillsComponent } from './pages/skills/skills.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { OfflinePageComponent } from './pages/offline-page/offline-page.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: HomeComponent,
        title: `${Constants.APP_NAME} — Home`,
        data: {
          title: `${Constants.APP_NAME} — Home`,
          description: 'Explore the modern portfolio of Avinash Marbhal, a skilled front-end developer specializing in Angular, React, and modern web technologies.',
          keywords: 'Avinash Marbhal, portfolio, front-end developer, Angular developer, web development, Kolhapur',
          image: '/assets/images/yihwxx74geyo1xe1xejz.avif'
        }
    },
    {
        path: 'about',
        component: AboutComponent,
        title: `${Constants.APP_NAME} — About`,
        data: {
          title: `${Constants.APP_NAME} — About`,
          description: 'Learn more about Avinash Marbhal\'s background, journey as a developer, and his passion for building high-quality web applications.',
          keywords: 'about Avinash Marbhal, developer bio, experience, skills',
          image: '/assets/images/yihwxx74geyo1xe1xejz.avif'
        }
    },
    {
        path: 'contact',
        component: ContactComponent,
        title: `${Constants.APP_NAME} — Contact`,
        data: {
          title: `${Constants.APP_NAME} — Contact`,
          description: 'Get in touch with Avinash Marbhal for project inquiries, collaborations, or professional opportunities.',
          keywords: 'contact developer, hire Avinash Marbhal, collaboration',
          image: '/assets/images/yihwxx74geyo1xe1xejz.avif'
        }
    },
    {
        path: 'services',
        component: ServicesComponent,
        title: `${Constants.APP_NAME} — Services`,
        data: {
          title: `${Constants.APP_NAME} — Services`,
          description: 'Providing high-quality front-end and full-stack development services, including UI/UX implementation, API integration, and performance optimization.',
          keywords: 'web development services, front-end consulting, Angular development services',
          image: '/assets/images/yihwxx74geyo1xe1xejz.avif'
        }
    },
    {
        path: 'skills',
        component: SkillsComponent,
        title: `${Constants.APP_NAME} — Skills`,
        data: {
          title: `${Constants.APP_NAME} — Skills`,
          description: 'Detailed overview of technical expertise including Angular, React, TypeScript, Node.js, and modern styling tools like Tailwind CSS and Scss.',
          keywords: 'developer skills, tech stack, Angular expertise, front-end technologies',
          image: '/assets/images/yihwxx74geyo1xe1xejz.avif'
        }
    },
    {
        path: 'projects',
        component: ProjectsComponent,
        title: `${Constants.APP_NAME} — Projects`,
        data: {
          title: `${Constants.APP_NAME} — Projects`,
          description: 'A showcase of web development projects, including HRM portals, CRM systems, and modern web applications built by Avinash Marbhal.',
          keywords: 'portfolio projects, Angular projects, web development showcase',
          image: '/assets/images/yihwxx74geyo1xe1xejz.avif'
        }
    },
    // {
    //   path: 'offline',
    //   component: OfflinePageComponent,
    //   title: `${Constants.APP_NAME} — Offline`,
    //   data: {
    //     title: `${Constants.APP_NAME} — Offline`,
    //     description: 'You are currently offline. Please check your internet connection.',
    //     keywords: 'offline, no internet',
    //     image: '/assets/images/yihwxx74geyo1xe1xejz.avif'
    //   }
    // },
    {
        path: '**',
        component: NotFoundComponent,
        title: '404 - Page not found',
        data: {
          title: '404 - Page not found',
          description: 'The page you are looking for does not exist.',
          image: '/assets/images/yihwxx74geyo1xe1xejz.avif'
        }
    }
];
