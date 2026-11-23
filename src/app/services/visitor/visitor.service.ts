import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VisitorService {

  http = inject(HttpClient);

  getIPDetails(): Observable<any> {
    return this.http.get('https://ipapi.co/json/');
  }

  addVisitor(data: any): Observable<any> {
    return this.http.post(environment.apiUrl + '/visitor/log', data);
  }

  getVisitor(): Observable<any> {
    return this.http.get(environment.apiUrl + '/visitor/all');
  }

  getVisitorCount(): Observable<any> {
    return this.http.get(environment.apiUrl + '/visitor/count');
  }
}
