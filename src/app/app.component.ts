import { Component, HostListener, inject, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import * as AOS from 'aos';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { ThemeService } from './services/theme/theme.service';
import { isPlatformBrowser } from '@angular/common';
import { VisitorService } from './services/visitor/visitor.service';
import { SeoService } from './services/seo/seo.service';
import { NetworkService } from './services/network/network.service';
import { OfflinePageComponent } from './pages/offline-page/offline-page.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, OfflinePageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'modern-portfolio';
  isBrowser: boolean = false;
  showScrollTop: boolean = false;
  visitorService = inject(VisitorService);
  seoService = inject(SeoService);
  networkService = inject(NetworkService);
  ipDetails: any;
  isOnline: boolean = true;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private themeService: ThemeService
  ) {
    this.seoService.init();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && isPlatformBrowser(this.platformId)) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.networkService.onlineStatus$.subscribe(status => {
      this.isOnline = status;
    });

    AOS.init({
      duration: 1000,
      // once: true,
      mirror: false
    });
    this.addNewVisitor();
  }

  addNewVisitor(): void {
    this.visitorService.getIPDetails().subscribe({
      next: (res: any) => {
        this.ipDetails = res;
        if (this.ipDetails) {
          this.visitorService.addVisitor(this.ipDetails).subscribe({
            next: (res) => {
              // console.log(res);
            },
            error: (err) => {
              // console.log(err);
            }
          });
        }
      },
      error: (err) => {
        // console.log(err);
      }
    });


  }

  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.isBrowser) return;
    const y = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.showScrollTop = y > 300;
  }

  scrollToTop() {
    if (!this.isBrowser) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Disable Ctrl+C (Copy)
    if (event.ctrlKey && event.key === 'c') {
      event.preventDefault();
    }

    // Disable Ctrl+P (Print)
    if (event.ctrlKey && event.key === 'p') {
      event.preventDefault();
    }

    // Disable F12 (Inspect Element)
    if (event.key === 'F12') {
      event.preventDefault();
    }

    // Disable Ctrl+Shift+I (Inspect Element)
    if (event.ctrlKey && event.shiftKey && event.key === 'I') {
      event.preventDefault();
    }

    // Disable Ctrl+U (View Source)
    if (event.ctrlKey && event.key === 'u') {
      event.preventDefault();
    }
  }
}
