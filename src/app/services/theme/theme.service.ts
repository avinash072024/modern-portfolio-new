import { effect, Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Constants } from '../../models/constants';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Signals for reactive state initialized with defaults
  theme = signal('light');
  skin = signal('default-blue');
  private platformId = inject(PLATFORM_ID);

  constructor(
    private sessionService: SessionService
  ) {
    const isBrowser = isPlatformBrowser(this.platformId);

    if (isBrowser) {
      this.theme.set(localStorage.getItem(Constants.THEME_KEY) || 'light');
      this.skin.set(localStorage.getItem(Constants.SKIN_KEY) || 'default-blue');
    }

    // Automatically update DOM and localStorage when signals change
    effect(() => {
      if (isBrowser) {
        document.documentElement.setAttribute('data-bs-theme', this.theme());
        document.documentElement.setAttribute('data-skin', this.skin());
        localStorage.setItem(Constants.THEME_KEY, this.theme());
        localStorage.setItem(Constants.SKIN_KEY, this.skin());
        // Update meta theme-color to match the current skin's primary color
        try {
          const style = getComputedStyle(document.documentElement);
          const primary = style.getPropertyValue('--bs-primary')?.trim() || '';
          const meta = document.querySelector('meta[name="theme-color"]');
          if (meta && primary) {
            meta.setAttribute('content', primary);
          }
        } catch (e) {
          // ignore on server or if not available
        }
      }
    });
  }

  toggleTheme(theme: string) {
    this.theme.set(theme);
    this.sessionService.setThemeSession(this.theme());
  }

  setSkin(color: string) {
    this.skin.set(color);
    this.sessionService.setSkinSession(this.skin());
  }
}
