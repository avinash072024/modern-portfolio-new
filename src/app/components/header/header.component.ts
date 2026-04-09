import { Component, HostListener, inject, signal } from '@angular/core';
import { ThemeService } from '../../services/theme/theme.service';
import { Constants } from '../../models/constants';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AboutMe } from '../../interfaces/about-me';
import { ContactService } from '../../services/contact/contact.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  themeService = inject(ThemeService);
  isScrolled = signal(false);
  appName1: string = Constants.APP_NAME1;
  appName2: string = Constants.APP_NAME2;
  currentYear: number = new Date().getFullYear();
  // myInformation: AboutMe = Constants.ABOUT_ME;
  myInformation: any;
  contactService = inject(ContactService);

  skins = [
    { name: 'Default Blue', class: 'default-blue', hex: '#0d6efd' },
    { name: 'Emerald', class: 'emerald-green', hex: '#198754' },
    { name: 'Purple', class: 'vibrant-purple', hex: '#6610f2' },
    { name: 'Hot Pink', class: 'hot-pink', hex: '#d63384' },
    { name: 'Sunset', class: 'sunset-orange', hex: '#fd7e14' },
    { name: 'Cyan Wave', class: 'cyan-wave', hex: '#0dcaf0' },
    { name: 'Crimson', class: 'crimson-red', hex: '#dc3545' }
  ];

  navLinks = [
    { id: 1, path: '/home', label: 'Home' },
    { id: 2, path: '/about', label: 'About' },
    { id: 3, path: '/services', label: 'Services' },
    { id: 4, path: '/projects', label: 'Projects' },
    { id: 5, path: '/skills', label: 'Skills' },
    { id: 6, path: '/contact', label: 'Contact' },
  ]

  ngOnInit(): void {
    this.getContactDetails();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 50);
  }

  getContactDetails(): void {
    this.contactService.getContact().subscribe({
      next: (res: any) => {
        if (res?.success && res?.contact) {
          this.myInformation = res.contact;
        }
      },
      error: (err: any) => {
        // alert(err.error.message || 'Failed to load contact details');
      }
    });
  }
}
