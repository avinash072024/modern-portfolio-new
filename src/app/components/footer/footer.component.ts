import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Constants } from '../../models/constants';
import { TitleCasePipe } from '@angular/common';
import { ContactService } from '../../services/contact/contact.service';
import { VisitorService } from '../../services/visitor/visitor.service';
import { forkJoin } from 'rxjs';

interface dynamicObject {
  id: number;
  name: string;
  path: string;
}

@Component({
  selector: 'app-footer',
  imports: [RouterLink, TitleCasePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  myInformation: any;
  appName1: string = Constants.APP_NAME1;
  appName2: string = Constants.APP_NAME2;
  contactService = inject(ContactService);
  visitorService = inject(VisitorService);
  isLoading = signal(true); // 1. Added loading signal

  visitorCount: number = 0;

  exploreMoreLinks: dynamicObject[] = [
    { id: 1, name: 'About Me', path: '/about' },
    { id: 2, name: 'Skills', path: '/skills' },
    { id: 3, name: 'Projects', path: '/projects' },
    { id: 4, name: 'Contact', path: '/contact' }
  ];

  focusAreaBadges: dynamicObject[] = [
    { id: 1, name: 'Angular 19', path: '' },
    { id: 2, name: 'Bootstrap', path: '' },
    { id: 3, name: 'Angular PWA', path: '' },
    { id: 4, name: 'Themeable UI', path: '' }
  ];

  ngOnInit(): void {
    this.getInitialData();
  }

  getInitialData(): void {
    this.isLoading.set(true);
    forkJoin({
      contact: this.contactService.getContact(),
      visitor: this.visitorService.getVisitor()
    }).subscribe({
      next: (res: any) => {
        // Handle Contact Data
        if (res.contact?.success && res.contact?.contact) {
          this.myInformation = res.contact.contact;
        }

        // Handle Visitor Data
        if (res.visitor?.success && res.visitor?.Visitors) {
          this.visitorCount = res.visitor?.count;
        }
        this.isLoading.set(false);
      },
      error: (err: any) => {
        // console.error('One or more requests failed', err);
        // Note: forkJoin will trigger the error block if ANY of the requests fail.
        this.isLoading.set(false);
      }
    });
  }
}
