import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  constructor(@Inject(DOCUMENT) private document: Document) {}

  init() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      filter(route => route.outlet === 'primary'),
      mergeMap(route => route.data)
    ).subscribe(data => {
      this.updateTags(data);
    });
  }

  private updateTags(data: any) {
    if (data.title) {
      this.titleService.setTitle(data.title);
      this.metaService.updateTag({ property: 'og:title', content: data.title });
      this.metaService.updateTag({ name: 'twitter:title', content: data.title });
    }

    if (data.description) {
      this.metaService.updateTag({ name: 'description', content: data.description });
      this.metaService.updateTag({ property: 'og:description', content: data.description });
      this.metaService.updateTag({ name: 'twitter:description', content: data.description });
    }

    if (data.keywords) {
      this.metaService.updateTag({ name: 'keywords', content: data.keywords });
    }

    if (data.image) {
      this.metaService.updateTag({ property: 'og:image', content: data.image });
      this.metaService.updateTag({ name: 'twitter:image', content: data.image });
    }

    const url = 'https://avinash-modern-portfolio.netlify.app' + this.router.url;
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.updateCanonicalUrl(url);
  }

  private updateCanonicalUrl(url: string) {
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
