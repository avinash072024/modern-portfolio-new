import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SkillsResponse } from '../../interfaces/skills';

@Injectable({
  providedIn: 'root'
})
export class SkillsService {
  http = inject(HttpClient);

  getAllSkills(page: number = 1, limit: number = 5): Observable<any> {
    const params = `?page=${page}&limit=${limit}`;
    return this.http.get(`${environment.apiUrl}/skills${params}`);
  }

  getSkills(): Observable<SkillsResponse> {
    return this.http.get<SkillsResponse>(`${environment.apiUrl}/skills`);
  }
}
