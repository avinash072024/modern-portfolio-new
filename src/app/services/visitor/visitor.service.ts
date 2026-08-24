import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class VisitorService {

  constructor(private http: HttpClient) { }

  private cache = new Map<string, { timestamp: number; obs: Observable<any> }>();
  private cacheTTL = 1000 * 60 * 5; // 5 minutes

  private getCached(key: string, fetch: () => Observable<any>): Observable<any> {
    const now = Date.now();
    const hit = this.cache.get(key);
    if (hit && now - hit.timestamp < this.cacheTTL) {
      return hit.obs;
    }
    const obs = fetch().pipe(shareReplay({ bufferSize: 1, refCount: true }));
    this.cache.set(key, { timestamp: now, obs });
    return obs;
  }

  getIPDetails(): Observable<any> {
    // return this.http.get('http://ip-api.com/json/');
    return this.getCached('ip_details', () => this.http.get('https://ipapi.co/json/'));
  }

  addVisitor(data: any): Observable<any> {
    this.cache.clear();
    return this.http.post(environment.apiUrl + '/visitor/log', data);
  }

  getVisitor(): Observable<any> {
    return this.getCached('visitors_all', () => this.http.get(environment.apiUrl + '/visitor/all'));
  }
}
