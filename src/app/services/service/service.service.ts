import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Service } from '../../interfaces/service';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  constructor(private http: HttpClient) { }

  // GET /api/services
  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${environment.apiUrl}/services`);
  }
}
