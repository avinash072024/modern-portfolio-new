import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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

  getContact(): Observable<{success: boolean; contact: ContactInfo}> {
    return this.http.get<{success: boolean; contact: ContactInfo}>(environment.apiUrl + `/contact`);
  }
}
