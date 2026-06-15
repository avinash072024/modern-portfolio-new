import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Constants } from '../../models/constants';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private isBrowser: boolean;
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // theme
  setThemeSession(theme: string): void {
    if (this.isBrowser) {
      localStorage.setItem(Constants.THEME_KEY, theme);
    }
  }

  getThemeSession(): void {
    if (this.isBrowser) {
      localStorage.getItem(Constants.THEME_KEY);
    }
  }

  clearThemeSession(): void {
    if (this.isBrowser) {
      localStorage.removeItem(Constants.THEME_KEY);
    }
  }

  // skin
  setSkinSession(skinColor: string): void {
    if (this.isBrowser) {
      localStorage.setItem(Constants.SKIN_KEY, skinColor);
    }
  }

  getSkinSession(): void {
    if (this.isBrowser) {
      localStorage.getItem(Constants.SKIN_KEY);
    }
  }

  clearSkinSession(): void {
    if (this.isBrowser) {
      localStorage.removeItem(Constants.SKIN_KEY);
    }
  }
}
