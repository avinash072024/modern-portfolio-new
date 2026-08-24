import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private http = inject(HttpClient);

  createMail(data: any) {
    return this.http.post(`${environment.apiUrl}/emails`, data);
  }
}
