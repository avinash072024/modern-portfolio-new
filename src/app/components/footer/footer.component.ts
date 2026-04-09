import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Constants } from '../../models/constants';
import { AboutMe } from '../../interfaces/about-me';
import { TitleCasePipe } from '@angular/common';
import { ContactService } from '../../services/contact/contact.service';
import { VisitorService } from '../../services/visitor/visitor.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, TitleCasePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  // myInformation: AboutMe = Constants.ABOUT_ME;
  myInformation: any;
  appName1: string = Constants.APP_NAME1;
  appName2: string = Constants.APP_NAME2;
  contactService = inject(ContactService);
  visitorService = inject(VisitorService);

  visitorCount: number = 0;

  ngOnInit(): void {
    this.getInitialData();
  }

  getInitialData(): void {
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
      },
      error: (err: any) => {
        // console.error('One or more requests failed', err);
        // Note: forkJoin will trigger the error block if ANY of the requests fail.
      }
    });
  }
}
