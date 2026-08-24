import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly meta = inject(Meta);

  private initialized = false;

  init(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.initSearchConsoleVerification();

    const measurementId = environment.googleAnalyticsId?.trim();
    if (!measurementId) {
      return;
    }

    this.loadGtagScript(measurementId);
    this.trackRouteChanges(measurementId);
  }

  trackEvent(
    eventName: string,
    params?: Record<string, string | number | boolean>
  ): void {
    if (!isPlatformBrowser(this.platformId) || !environment.googleAnalyticsId?.trim()) {
      return;
    }

    window.gtag?.('event', eventName, params);
  }

  private initSearchConsoleVerification(): void {
    const verificationCode = environment.googleSiteVerification?.trim();
    if (!verificationCode) {
      return;
    }

    this.meta.updateTag({
      name: 'google-site-verification',
      content: verificationCode
    });
  }

  private loadGtagScript(measurementId: string): void {
    if (this.initialized) {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { send_page_view: false });

    const script = this.document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    this.document.head.appendChild(script);

    this.initialized = true;
  }

  trackRouteChanges(measurementId: string): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        window.gtag?.('config', measurementId, {
          page_path: this.router.url,
          page_location: `${environment.siteUrl}${this.router.url}`
        });
      });
  }
}
