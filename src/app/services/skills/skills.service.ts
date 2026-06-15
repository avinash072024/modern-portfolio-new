import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SkillsService {
  
  private cache = new Map<string, { timestamp: number; obs: Observable<any> }>();
  private cacheTTL = 1000 * 60 * 5; // 5 minutes

  constructor(private http: HttpClient) { }

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

  getAllSkills(page: number = 1, limit: number = 5): Observable<any> {
    const params = `?page=${page}&limit=${limit}`;
    const key = `skills_page_${page}_limit_${limit}`;
    return this.getCached(key, () => this.http.get(`${environment.apiUrl}/skills${params}`));
  }

  getSkills(): Observable<any> {
    return this.getCached('skills_all', () => this.http.get(`${environment.apiUrl}/skills`));
  }

  getSkillById(id: string): Observable<any> {
    const key = `skills_id_${id}`;
    return this.getCached(key, () => this.http.get(environment.apiUrl + `/skills/${id}`));
  }

  addSkill(data: any): Observable<any> {
    this.cache.clear();
    return this.http.post(environment.apiUrl + '/skills', data);
  }

  updateSkill(id: string, data: any): Observable<any> {
    this.cache.clear();
    return this.http.put(environment.apiUrl + `/skills/${id}`, data);
  }

  deleteSkill(id: string): Observable<any> {
    this.cache.clear();
    return this.http.delete(environment.apiUrl + `/skills/${id}`)
  }
}
