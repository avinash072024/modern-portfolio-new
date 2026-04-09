import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

export interface ContactInfo {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  resumeUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private http = inject(HttpClient);

  // cached observable so HTTP request happens only once
  private contactRequest$: Observable<{ success: boolean; contact: ContactInfo }> | null = null;

  getContact(): Observable<{ success: boolean; contact: ContactInfo }> {
    if (!this.contactRequest$) {
      this.contactRequest$ = this.http
        .get<{ success: boolean; contact: ContactInfo }>(`${environment.apiUrl}/contact`)
        .pipe(shareReplay({ bufferSize: 1, refCount: true }));
    }
    return this.contactRequest$;
  }

  // optional: allow clearing the cached request (useful for updates or refresh)
  clearCache(): void {
    this.contactRequest$ = null;
  }
}
